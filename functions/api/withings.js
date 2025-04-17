// functions/api/withings.js

const stmts = new Map();

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

  // Parse days param (default to 365)
  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days') || '365';

  // Prepare (and cache) a statement per daysParam
  let stmt = stmts.get(daysParam);
  if (!stmt) {
    stmt = env.DB.prepare(`
      SELECT
        date,
        weight,
        fat_ratio
      FROM withings_data
      WHERE date >= datetime('now', '-${daysParam} days')
      ORDER BY date DESC
    `);
    stmts.set(daysParam, stmt);
  }

  // Try edge cache
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log(`Serving Withings (${daysParam}d) from cache`);
    return cached;
  }

  try {
    const { results } = await stmt.all();
    console.log(`Withings → ${results.length} rows`);

    const body = JSON.stringify(results);
    const response = new Response(body, { headers });

    // Populate cache in background
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    console.error('Error in Withings API:', error);
    return new Response(JSON.stringify({
      error: error.message,
      code: 'DB_ERROR',
      timestamp: new Date().toISOString(),
      details: error.toString()
    }), {
      status: 500,
      headers
    });
  }
}
