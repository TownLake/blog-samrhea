// functions/api/search.ts
import { error, json } from 'itty-router-extras';

interface Env {
  AI: any;
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
    
    // Generate embedding using the new BGE-M3 model
    // Note the changed payload format and model name
    const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
      contexts: [
        {
          text: query
        }
      ]
    });
    
    // The response structure is different with BGE-M3
    // It returns an array with a single embedding array inside
    if (!embeddingResponse?.response || !Array.isArray(embeddingResponse.response)) {
      return error(500, 'Failed to generate embedding');
    }
    
    // Extract the embedding vector based on the new format
    // BGE-M3 returns [[...vector...]] format
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
    
    // Process and format results
    const results: SearchResult[] = vectorizeResponse.matches
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
