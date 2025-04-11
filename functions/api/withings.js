// functions/api/withings.js
export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Create cache key
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    console.log('Serving Withings data from cache');
    return cachedResponse;
  }

  try {
    if (!env.DB) {
      throw new Error('Database binding not found');
    }

    // Get up to 365 days of data (a full year)
    console.log('Querying Withings data...');
    const data = await env.DB.prepare(`
      SELECT * FROM withings_data 
      WHERE date >= datetime('now', '-365 days')
      ORDER BY date DESC
    `).all();

    if (!data || !data.results) {
      throw new Error('Failed to retrieve data from database');
    }

    console.log('Withings data retrieved:', data.results.length, 'records');
    
    const response = new Response(
      JSON.stringify(data.results || []), 
      { headers }
    );

    waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
  } catch (error) {
    console.error('Error in Withings API:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'DB_ERROR',
        timestamp: new Date().toISOString(),
        details: error.toString()
      }), 
      { status: 500, headers }
    );
  }
}