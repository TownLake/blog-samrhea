// functions/api/search.ts
import { error, json } from 'itty-router-extras';

interface Env {
  AI: any; // Use 'any' for simplicity, or define a more specific type if you prefer
  VECTORIZE: any;
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

    // Generate embedding using Workers AI with BGE-M3 model
    const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
      contexts: [{ text: query }]
    });

    // Check if we received a valid response from the AI model
    if (!embeddingResponse?.result?.response) {
      return error(500, 'Failed to generate embedding');
    }

    // Extract the query vector from the response
    // BGE-M3 returns the embedding in result.response
    const queryVector = embeddingResponse.result.response;

    // Ensure we have a valid vector
    if (!Array.isArray(queryVector) || !queryVector.length) {
      return error(500, 'Invalid embedding response format');
    }

    // Query Vectorize DB with the embedding
    const vectorizeResponse = await env.VECTORIZE.query(queryVector, {
      topK: 5,
      returnMetadata: 'all',
    });

    // If no matches found, return an empty array
    if (!vectorizeResponse?.matches) {
      return json([]);
    }

    // Process and format results
    const results: SearchResult[] = vectorizeResponse.matches
      .filter((match: any) => match.metadata?.title && match.metadata?.slug)
      .map((match: any) => ({
        title: match.metadata!.title!,
        slug: match.metadata!.slug!,
        score: match.score?.toFixed(4) ?? 'N/A',
      }));

    return json(results);
  } catch (err: any) {
    console.error('Search error:', err);
    return error(500, 'An error occurred while processing your search request');
  }
};
