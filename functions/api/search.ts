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
    try {
      console.log('Generating embedding for query:', query);
      
      const embeddingResponse = await env.AI.run('@cf/baai/bge-m3', {
        contexts: [{ text: query }]
      });
      
      console.log('Embedding response structure:', JSON.stringify({
        hasResult: !!embeddingResponse?.result,
        resultKeys: embeddingResponse?.result ? Object.keys(embeddingResponse.result) : 'none',
        responseType: embeddingResponse?.result?.response ? typeof embeddingResponse.result.response : 'none',
        isArray: embeddingResponse?.result?.response ? Array.isArray(embeddingResponse.result.response) : false
      }));

      // Check if we received a valid response from the AI model
      if (!embeddingResponse?.result?.response) {
        console.error('Invalid embedding response:', JSON.stringify(embeddingResponse));
        return error(500, 'Failed to generate embedding: Invalid response structure');
      }
    } catch (embeddingError) {
      console.error('Error generating embedding:', embeddingError);
      return error(500, `Failed to generate embedding: ${embeddingError.message || 'Unknown error'}`);
    }

    // Extract the query vector from the response
    // BGE-M3 returns the embedding in result.response
    const responseData = embeddingResponse.result.response;
    console.log('Response data type:', typeof responseData);
    console.log('Is array:', Array.isArray(responseData));
    
    let queryVector;
    
    // Handle different potential response formats
    if (Array.isArray(responseData)) {
      if (responseData.length === 0) {
        return error(500, 'Empty embedding array returned');
      }
      
      if (responseData.length === 1 && Array.isArray(responseData[0])) {
        // Format: [[ ... vector ... ]]
        queryVector = responseData[0];
        console.log('Extracted nested vector with length:', queryVector.length);
      } else if (typeof responseData[0] === 'number') {
        // Format: [ ... vector ... ]
        queryVector = responseData;
        console.log('Using direct vector with length:', queryVector.length);
      } else {
        // Unknown format - log it for debugging
        console.error('Unexpected embedding format:', JSON.stringify(responseData.slice(0, 5)));
        return error(500, 'Unsupported embedding response format');
      }
    } else {
      console.error('Embedding response is not an array:', typeof responseData);
      return error(500, 'Invalid embedding format: not an array');
    }

    // Final validation of the vector
    if (!queryVector || !Array.isArray(queryVector) || !queryVector.length) {
      return error(500, 'Failed to extract a valid embedding vector');
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
