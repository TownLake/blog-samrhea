// functions/api/news.js

const stmts = new Map(); // Cache for prepared statements

export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (!env.NEWS_DB) {
    console.error('NEWS_DB binding not found');
    return new Response(JSON.stringify({ error: 'Database binding not configured for news' }), { status: 500, headers });
  }

  const url = new URL(request.url);
  // Parse parameters with defaults
  const daysParam = parseInt(url.searchParams.get('days') || '90', 10);
  const sourceDaysParam = parseInt(url.searchParams.get('sourceDays') || '30', 10);
  const limitParam = parseInt(url.searchParams.get('limit') || '5', 10);

  // Validate parsed integer parameters
  if (isNaN(daysParam) || isNaN(sourceDaysParam) || isNaN(limitParam)) {
    return new Response(JSON.stringify({ error: 'Invalid query parameters' }), { status: 400, headers });
  }


  const cache = caches.default;
  const cacheKeyRequest = new Request(request.url, request);
  const cachedResponse = await cache.match(cacheKeyRequest);
  if (cachedResponse) {
    console.log('Serving news data from cache');
    return cachedResponse;
  }

  try {
    const db = env.NEWS_DB;

    // --- Query for articles read by day ---
    let articlesByDayStmt = stmts.get('articlesByDay');
    if (!articlesByDayStmt) {
      articlesByDayStmt = db.prepare(`
        SELECT DATE(clicked_at) as date, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1) -- Placeholder for days
        GROUP BY DATE(clicked_at)
        ORDER BY DATE(clicked_at) ASC
      `);
      stmts.set('articlesByDay', articlesByDayStmt);
    }

    // --- Query for articles read by source ---
    let articlesBySourceStmt = stmts.get('articlesBySource');
    if (!articlesBySourceStmt) {
      articlesBySourceStmt = db.prepare(`
        SELECT source, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1) -- Placeholder for days
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
      `);
      stmts.set('articlesBySource', articlesBySourceStmt);
    }

    // --- Query for articles read by time of day (hour) ---
    let articlesByHourStmt = stmts.get('articlesByHour');
    if (!articlesByHourStmt) {
      articlesByHourStmt = db.prepare(`
        SELECT STRFTIME('%H', clicked_at) as hour, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1) -- Placeholder for days
        GROUP BY STRFTIME('%H', clicked_at)
        ORDER BY hour ASC
      `);
      stmts.set('articlesByHour', articlesByHourStmt);
    }
    
    // --- Query for most recent articles ---
    let recentArticlesStmt = stmts.get('recentArticles');
    if (!recentArticlesStmt) {
      recentArticlesStmt = db.prepare(`
        SELECT link, headline, source, clicked_at
        FROM news
        ORDER BY clicked_at DESC
        LIMIT ?1 -- Placeholder for limit
      `);
      stmts.set('recentArticles', recentArticlesStmt);
    }

    // Execute all queries concurrently with bound parameters
    const [
      articlesByDayResults,
      articlesBySourceResults,
      articlesByHourResults,
      recentArticlesResults
    ] = await Promise.all([
      articlesByDayStmt.bind(`-${daysParam} days`).all(),
      articlesBySourceStmt.bind(`-${sourceDaysParam} days`).all(),
      articlesByHourStmt.bind(`-${sourceDaysParam} days`).all(),
      recentArticlesStmt.bind(limitParam).all()
    ]);

    const responsePayload = {
      articlesByDay: articlesByDayResults.results || [],
      articlesBySource: articlesBySourceResults.results || [],
      // Ensure 'hour' is an integer for easier chart handling
      articlesByHour: articlesByHourResults.results ? articlesByHourResults.results.map(r => ({...r, hour: parseInt(r.hour,10)})) : [],
      recentArticles: recentArticlesResults.results || [],
    };

    const response = new Response(JSON.stringify(responsePayload), { headers });
    waitUntil(cache.put(cacheKeyRequest, response.clone()));
    return response;

  } catch (e) {
    console.error('Error fetching news data from D1:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch news data from D1', details: e.message }), { status: 500, headers });
  }
}