// functions/api/news.js

console.log("NEWS API: File loaded, defining stmts map."); // Log when the module itself is loaded
const stmts = new Map();

export async function onRequest(context) {
  // ---> ADDED LOG: Very first line in the handler <---
  console.log("NEWS API: onRequest invoked. Request URL:", context.request.url, "Method:", context.request.method);

  const { request, env, waitUntil } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600'
  };

  if (request.method === 'OPTIONS') {
    console.log("NEWS API: Handling OPTIONS request.");
    return new Response(null, { headers });
  }

  // ---> ADDED LOG: Before DB check <---
  console.log("NEWS API: Checking for NEWS_DB binding...");
  if (!env.NEWS_DB) {
    console.error('NEWS API: FATAL - NEWS_DB D1 binding not found in worker environment.');
    return new Response(JSON.stringify({ error: 'Database binding not configured for news' }), { status: 500, headers });
  }
  console.log("NEWS API: NEWS_DB binding found.");

  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get('days') || '90', 10);
  const sourceDaysParam = parseInt(url.searchParams.get('sourceDays') || '30', 10);
  const limitParam = parseInt(url.searchParams.get('limit') || '5', 10);

  // ---> ADDED LOG: After parsing params <---
  console.log(`NEWS API: Parsed params - days: ${daysParam}, sourceDays: ${sourceDaysParam}, limit: ${limitParam}`);

  if (isNaN(daysParam) || isNaN(sourceDaysParam) || isNaN(limitParam) || daysParam <= 0 || sourceDaysParam <= 0 || limitParam <= 0) {
    console.error("NEWS API: Invalid query parameters detected.");
    return new Response(JSON.stringify({ error: 'Invalid query parameters. Must be positive integers.' }), { status: 400, headers });
  }

  const cache = caches.default;
  const cacheKeyRequest = new Request(request.url, request);
  const cachedResponse = await cache.match(cacheKeyRequest);
  if (cachedResponse) {
    console.log('NEWS API: Serving news data from cache for URL:', request.url);
    return cachedResponse;
  }
  console.log('NEWS API: No cache hit, fetching from D1 for URL:', request.url);

  try {
    // ---> ADDED LOG: Entering TRY block <---
    console.log("NEWS API: Entering TRY block for D1 queries.");
    const db = env.NEWS_DB;

    // ... (rest of your D1 query preparation logic for articlesByDayStmt, etc.)
    // Query for articles read by day
    let articlesByDayStmt = stmts.get('articlesByDay');
    if (!articlesByDayStmt) {
      console.log("NEWS API: Preparing articlesByDayStmt");
      articlesByDayStmt = db.prepare(`
        SELECT DATE(clicked_at) as date, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1)
        GROUP BY DATE(clicked_at)
        ORDER BY DATE(clicked_at) ASC
      `);
      stmts.set('articlesByDay', articlesByDayStmt);
    }

    // Query for articles read by source
    let articlesBySourceStmt = stmts.get('articlesBySource');
    if (!articlesBySourceStmt) {
      console.log("NEWS API: Preparing articlesBySourceStmt");
      articlesBySourceStmt = db.prepare(`
        SELECT source, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1)
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
      `);
      stmts.set('articlesBySource', articlesBySourceStmt);
    }

    // Query for articles read by time of day (hour)
    let articlesByHourStmt = stmts.get('articlesByHour');
    if (!articlesByHourStmt) {
      console.log("NEWS API: Preparing articlesByHourStmt");
      articlesByHourStmt = db.prepare(`
        SELECT STRFTIME('%H', clicked_at) as hour, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1)
        GROUP BY STRFTIME('%H', clicked_at)
        ORDER BY hour ASC
      `);
      stmts.set('articlesByHour', articlesByHourStmt);
    }
    
    // Query for most recent articles
    let recentArticlesStmt = stmts.get('recentArticles');
    if (!recentArticlesStmt) {
      console.log("NEWS API: Preparing recentArticlesStmt");
      recentArticlesStmt = db.prepare(`
        SELECT link, headline, source, clicked_at
        FROM news
        ORDER BY clicked_at DESC
        LIMIT ?1
      `);
      stmts.set('recentArticles', recentArticlesStmt);
    }
    
    console.log('NEWS API: Binding parameters and preparing to execute D1 queries...');
    const articlesByDayPromise = articlesByDayStmt.bind(`-${daysParam} days`).all();
    const articlesBySourcePromise = articlesBySourceStmt.bind(`-${sourceDaysParam} days`).all();
    const articlesByHourPromise = articlesByHourStmt.bind(`-${sourceDaysParam} days`).all();
    const recentArticlesPromise = recentArticlesStmt.bind(limitParam).all();
    
    console.log('NEWS API: Executing D1 queries via Promise.all...');
    const [
      articlesByDayResults,
      articlesBySourceResults,
      articlesByHourResults,
      recentArticlesResults
    ] = await Promise.all([
      articlesByDayPromise,
      articlesBySourcePromise,
      articlesByHourPromise,
      recentArticlesPromise
    ]);
    console.log('NEWS API: D1 queries completed successfully.');

    const responsePayload = {
      articlesByDay: articlesByDayResults.results || [],
      articlesBySource: articlesBySourceResults.results || [],
      articlesByHour: articlesByHourResults.results ? articlesByHourResults.results.map(r => ({...r, hour: parseInt(r.hour,10)})) : [],
      recentArticles: recentArticlesResults.results || [],
    };

    const response = new Response(JSON.stringify(responsePayload), { headers });
    waitUntil(cache.put(cacheKeyRequest, response.clone()));
    console.log('NEWS API: Response constructed and cached. Sending 200 OK.');
    return response;

  } catch (e) {
    // ---> MODIFIED LOG: More detailed error logging <---
    console.error('NEWS API: CRITICAL ERROR in try/catch block:', e.message);
    console.error('NEWS API: Stack trace:', e.stack);
    if (e.cause) {
      console.error('NEWS API: Cause:', e.cause);
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch news data from D1', details: e.message }), { status: 500, headers });
  }
}