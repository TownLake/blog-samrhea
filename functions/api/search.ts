// functions/api/search.ts
import { error, json } from 'itty-router-extras';

interface Env {
  AI: any;
  VECTORIZE: any;
  // Add KV namespace for title-based searches
  BLOG_METADATA: KVNamespace;
}

interface SearchResult {
  title: string;
  slug: string;
  score: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { query } = await request.json() as { query: string };
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return error(400, 'Invalid input: query must be a non-empty string');
    }
    
    let results: SearchResult[] = [];
    
    // First, try to find exact or partial title matches from KV store
    // This assumes you have a KV namespace with all blog post metadata
    try {
      // Get all blog post metadata from KV
      // Note: For performance in production, consider using a proper title index
      // or a metadata list that's cached and refreshed periodically
      const metadataListJson = await env.BLOG_METADATA.get('all_posts_metadata');
      
      if (metadataListJson) {
        const metadataList = JSON.parse(metadataListJson);
        const searchTerm = query.toLowerCase();
        
        // Find exact or partial title matches
        const titleMatches = metadataList
          .filter((post: any) => 
            post.title && 
            (post.title.toLowerCase().includes(searchTerm) || 
             searchTerm.includes(post.title.toLowerCase()))
          )
          .map((post: any) => ({
            title: post.title,
            slug: post.slug,
            score: '1.0000' // Give title matches a perfect score
          }));
        
        // If we found title matches, add them to results
        if (titleMatches.length > 0) {
          results = titleMatches;
        }
      }
    } catch (kvError) {
      console.error('Error querying metadata KV:', kvError);
      // Continue with vector search even if KV fails
    }
    
    // If we already have title matches, return them
    // Otherwise, proceed with vector search
    if (results.length > 0) {
      return json(results);
    }
    
    // Generate embedding using the new BGE-M3 model
    const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
      contexts: [
        {
          text: query
        }
      ]
    });
    
    // The response structure is different with BGE-M3
    if (!embeddingResponse?.response || !Array.isArray(embeddingResponse.response)) {
      return error(500, 'Failed to generate embedding');
    }
    
    // Extract the embedding vector based on the new format
    const queryVector = Array.isArray(embeddingResponse.response[0]) 
      ? embeddingResponse.response[0]  // Format is [[...vector...]]
      : embeddingResponse.response;    // Format is [...vector...]
    
    // Query Vectorize DB with the new vector format
    const vectorizeResponse = await env.VECTORIZE.query(queryVector, {
      topK: 5,
      returnMetadata: 'all',
    });
    
    if (!vectorizeResponse?.matches) {
      return json([]);
    }
    
    // Process and format results from vector search
    results = vectorizeResponse.matches
      .filter((match: any) => match.metadata?.title && match.metadata?.slug)
      .map((match: any) => ({
        title: match.metadata.title,
        slug: match.metadata.slug,
        score: match.score?.toFixed(4) ?? 'N/A',
      }));
    
    return json(results);
  } catch (err: any) {
    console.error('Search error:', err);
    return error(500, 'An error occurred while processing your search request');
  }
};