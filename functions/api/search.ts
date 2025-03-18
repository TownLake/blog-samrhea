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

    console.log('Received search query:', query);

    // Try approach 1: Using contexts with a query to generate embeddings
    try {
      console.log('Trying BGE-M3 with query as context...');
      const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
        contexts: [{ text: query }]
      });

      console.log('Embedding response received');
      
      // Check if we have a valid response
      if (embeddingResponse && embeddingResponse.response && Array.isArray(embeddingResponse.response)) {
        console.log('Found embedding in response.response');
        const queryVector = embeddingResponse.response;
        return await performVectorSearch(env, queryVector);
      }
      
      // Alternative format check
      if (embeddingResponse && embeddingResponse.result && embeddingResponse.result.response && 
          Array.isArray(embeddingResponse.result.response)) {
        console.log('Found embedding in result.response');
        const queryVector = embeddingResponse.result.response;
        return await performVectorSearch(env, queryVector);
      }
      
      // Check for raw format
      if (embeddingResponse && Array.isArray(embeddingResponse)) {
        console.log('Found embedding in direct response');
        const queryVector = embeddingResponse;
        return await performVectorSearch(env, queryVector);
      }
      
      console.log('BGE-M3 response structure:', JSON.stringify({
        hasResponse: !!embeddingResponse,
        topLevelKeys: embeddingResponse ? Object.keys(embeddingResponse) : []
      }));
      
    } catch (e) {
      console.error('Error with BGE-M3 approach:', e);
    }

    // Fallback to approach 2: Use bge-base model which we know works
    try {
      console.log('Falling back to bge-base-en-v1.5...');
      const fallbackResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: query
      });
      
      if (fallbackResponse && fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
        // We need to resize from 768 to 1024 dimensions
        const originalVector = fallbackResponse.data[0];
        const resizedVector = resizeVector(originalVector, 1024);
        console.log(`Resized vector from ${originalVector.length} to ${resizedVector.length} dimensions`);
        
        return await performVectorSearch(env, resizedVector);
      }
    } catch (e) {
      console.error('Error with fallback approach:', e);
    }

    return error(500, 'Failed to generate embedding with either approach');
  } catch (err: any) {
    console.error('Search error:', err);
    return error(500, 'An error occurred while processing your search request');
  }
};

// Function to resize a vector to the target dimensions
function resizeVector(vector: number[], targetSize: number): number[] {
  const currentSize = vector.length;
  
  if (currentSize === targetSize) {
    return vector;
  }
  
  if (currentSize > targetSize) {
    // If larger, select evenly spaced elements
    const result = [];
    for (let i = 0; i < targetSize; i++) {
      const index = Math.floor(i * currentSize / targetSize);
      result.push(vector[index]);
    }
    return result;
  } else {
    // If smaller, repeat the vector
    const repeats = Math.ceil(targetSize / currentSize);
    let result = [];
    for (let i = 0; i < repeats; i++) {
      result = result.concat(vector);
    }
    return result.slice(0, targetSize);
  }
}

// Function to perform the vector search
async function performVectorSearch(env: Env, queryVector: number[]): Promise<Response> {
  try {
    console.log(`Querying Vectorize with ${queryVector.length}-dimensional vector`);
    
    const vectorizeResponse = await env.VECTORIZE.query(queryVector, {
      topK: 5,
      returnMetadata: 'all',
    });

    if (!vectorizeResponse?.matches) {
      console.log('No matches found in Vectorize');
      return json([]);
    }

    const results: SearchResult[] = vectorizeResponse.matches
      .filter((match: any) => match.metadata?.title && match.metadata?.slug)
      .map((match: any) => ({
        title: match.metadata!.title!,
        slug: match.metadata!.slug!,
        score: match.score?.toFixed(4) ?? 'N/A',
      }));

    console.log(`Found ${results.length} matching results`);
    return json(results);
  } catch (e) {
    console.error('Error in vector search:', e);
    return error(500, `Error performing vector search: ${e.message || 'Unknown error'}`);
  }
}
