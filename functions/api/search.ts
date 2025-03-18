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

    // Use bge-base-en-v1.5 which we know works reliably
    console.log('Generating embedding with bge-base-en-v1.5...');
    const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: query
    });
    
    console.log('Embedding response received:', 
      embeddingResponse ? 'success' : 'null',
      'with data array:', 
      embeddingResponse?.data ? `length ${embeddingResponse.data.length}` : 'missing'
    );
    
    // Check if we got a valid response
    if (!embeddingResponse?.data || !embeddingResponse.data[0]) {
      return error(500, 'Failed to generate embedding');
    }
    
    // Extract the original vector (768 dimensions)
    const originalVector = embeddingResponse.data[0];
    console.log(`Original vector has ${originalVector.length} dimensions`);
    
    // Verify it's a proper array with numeric values
    if (!Array.isArray(originalVector) || originalVector.length === 0 || 
        typeof originalVector[0] !== 'number') {
      console.error('Invalid vector format:', 
        Array.isArray(originalVector) ? `Array length ${originalVector.length}` : typeof originalVector,
        typeof originalVector[0]
      );
      return error(500, 'Invalid embedding format');
    }
    
    // Resize the vector to 1024 dimensions
    const resizedVector = resizeVector(originalVector, 1024);
    console.log(`Resized vector to ${resizedVector.length} dimensions`);
    
    // Extra validation of the resized vector
    if (!Array.isArray(resizedVector) || resizedVector.length !== 1024 || 
        typeof resizedVector[0] !== 'number') {
      console.error('Invalid resized vector:',
        Array.isArray(resizedVector) ? `Array length ${resizedVector.length}` : typeof resizedVector
      );
      return error(500, 'Failed to resize embedding');
    }
    
    // Log first few vector elements for debugging
    console.log('Vector sample:', resizedVector.slice(0, 5));
    
    try {
      console.log('Querying Vectorize index...');
      // Now query Vectorize with our properly formatted vector
      const vectorizeResponse = await env.VECTORIZE.query(resizedVector, {
        topK: 5,
        returnMetadata: 'all',
      });
      
      console.log('Vectorize response received:', 
        vectorizeResponse ? 'success' : 'null',
        'with matches:',
        vectorizeResponse?.matches ? vectorizeResponse.matches.length : 'none'
      );
      
      // If no matches, return empty array
      if (!vectorizeResponse?.matches) {
        return json([]);
      }
      
      // Process results
      const results: SearchResult[] = vectorizeResponse.matches
        .filter((match: any) => match.metadata?.title && match.metadata?.slug)
        .map((match: any) => ({
          title: match.metadata!.title!,
          slug: match.metadata!.slug!,
          score: match.score?.toFixed(4) ?? 'N/A',
        }));
        
      console.log(`Found ${results.length} results`);
      return json(results);
    } catch (vectorizeError: any) {
      console.error('Vectorize error:', vectorizeError);
      // Include more details from the error for diagnosis
      return error(500, `Vectorize error: ${vectorizeError.message || 'Unknown error'}`);
    }
  } catch (err: any) {
    console.error('Overall search error:', err);
    return error(500, `Error: ${err.message || 'Unknown error'}`);
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
    const result = new Array(targetSize);
    for (let i = 0; i < targetSize; i++) {
      const index = Math.floor(i * currentSize / targetSize);
      result[i] = vector[index];
    }
    return result;
  } else {
    // If smaller, use interpolation to expand
    const result = new Array(targetSize);
    for (let i = 0; i < targetSize; i++) {
      const position = (i * (currentSize - 1)) / (targetSize - 1);
      const index = Math.floor(position);
      const fraction = position - index;
      
      if (index < currentSize - 1) {
        // Linear interpolation between two nearest values
        result[i] = vector[index] * (1 - fraction) + vector[index + 1] * fraction;
      } else {
        // For the edge case
        result[i] = vector[index];
      }
    }
    return result;
  }
}
