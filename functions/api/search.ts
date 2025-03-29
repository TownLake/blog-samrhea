// functions/api/search.ts
import { error, json } from 'itty-router-extras';

interface Env {
  AI: any;
  VECTORIZE: any;
  BLOG_METADATA: KVNamespace;
}

interface SearchResult {
  title: string;
  slug: string;
  score: string; // Keep as string to handle '1.0000' and formatted floats
  source: 'kv' | 'vector'; // Optional: Add source for debugging/UI differentiation
}

// Define a maximum number of results to return
const MAX_RESULTS = 5;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { query } = await request.json() as { query: string };

    if (!query || typeof query !== 'string') {
      return error(400, 'Invalid input: query must be a non-empty string');
    }

    let kvResults: SearchResult[] = [];
    let vectorResults: SearchResult[] = [];

    // --- 1. Perform KV Title Search ---
    try {
      const metadataListJson = await env.BLOG_METADATA.get('all_posts_metadata');
      if (metadataListJson) {
        const metadataList = JSON.parse(metadataListJson);
        const searchTerm = query.toLowerCase();

        kvResults = metadataList
          .filter((post: any) =>
            post.title &&
            (post.title.toLowerCase().includes(searchTerm) ||
             searchTerm.includes(post.title.toLowerCase())) // Consider refining matching logic if needed
          )
          .map((post: any) => ({
            title: post.title,
            slug: post.slug,
            score: '1.0000', // High score for direct title matches
            source: 'kv'      // Mark the source
          }));
      }
    } catch (kvError) {
      console.error('Error querying metadata KV:', kvError);
      // Log error but continue to vector search
    }

    // --- 2. Perform Vector Search ---
    try {
        // Generate embedding
        const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
          contexts: [{ text: query }] // Corrected BGE-M3 input structure
        });

        // Check for valid embedding response structure
        if (!embeddingResponse?.response || !Array.isArray(embeddingResponse.response) || embeddingResponse.response.length === 0) {
          console.error('Failed to generate embedding or invalid response format:', embeddingResponse);
          // Decide if you want to return an error or just continue without vector results
          // return error(500, 'Failed to generate embedding');
        } else {
            // Extract the embedding vector (handles potential nested array)
            const queryVector = Array.isArray(embeddingResponse.response[0])
              ? embeddingResponse.response[0]
              : embeddingResponse.response;

            // Query Vectorize DB
            const vectorizeResponse = await env.VECTORIZE.query(queryVector, {
              topK: MAX_RESULTS, // Query slightly more initially if combining aggressively
              returnMetadata: 'all',
            });

            if (vectorizeResponse?.matches) {
              vectorResults = vectorizeResponse.matches
                .filter((match: any) => match.metadata?.title && match.metadata?.slug)
                .map((match: any) => ({
                  title: match.metadata.title,
                  slug: match.metadata.slug,
                  score: match.score?.toFixed(4) ?? '0.0000', // Ensure score is always a string
                  source: 'vector' // Mark the source
                }));
            }
        }
    } catch (vectorError) {        
      console.error('Error during vector search:', vectorError);
      // Log error but potentially continue with just KV results if any
    }


    // --- 3. Combine, Deduplicate, and Rank Results ---

    // Use a Map for easy deduplication based on slug, prioritizing higher scores
    const combinedResultsMap = new Map<string, SearchResult>();

    // Add KV results first (they get priority if slugs match due to score 1.0)
    kvResults.forEach(result => {
        // Check if already exists - this check might be redundant if we sort later,
        // but explicit priority for KV can be done here if needed.
        // If KV always wins on duplicate slugs, just add it.
        combinedResultsMap.set(result.slug, result);
    });

    // Add Vector results, only if the slug doesn't already exist from KV
    // OR if you implement logic to keep the one with the higher score (KV usually wins here)
    vectorResults.forEach(result => {
      if (!combinedResultsMap.has(result.slug)) {
        combinedResultsMap.set(result.slug, result);
      }
      // Optional: If you want the absolute highest score regardless of source:
      // const existing = combinedResultsMap.get(result.slug);
      // if (!existing || parseFloat(result.score) > parseFloat(existing.score)) {
      //   combinedResultsMap.set(result.slug, result);
      // }
    });

    // Convert map values back to an array
    let finalResults = Array.from(combinedResultsMap.values());

    // --- 4. Sort the combined list by score (descending) ---
    finalResults.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

    // --- 5. Limit the results ---
    finalResults = finalResults.slice(0, MAX_RESULTS);

    return json(finalResults);

  } catch (err: any) {
    console.error('Search error:', err);
    return error(500, 'An error occurred while processing your search request');
  }
};