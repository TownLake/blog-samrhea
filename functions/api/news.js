// functions/api/news.js

const stmts = new Map(); // Cache for prepared statements

export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Adjust for production
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 1. Ensure NEWS_DB binding is correct and present in your wrangler.toml / Pages settings
  if (!env.NEWS_DB) {
    console.error('NEWS_DB D1 binding not found in worker environment.');
    return new Response(JSON.stringify({ error: 'Database binding not configured for news' }), { status: 500, headers });
  }

  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get('days') || '90', 10);
  const sourceDaysParam = parseInt(url.searchParams.get('sourceDays') || '30', 10);
  const limitParam = parseInt(url.searchParams.get('limit') || '5', 10);

  if (isNaN(daysParam) || isNaN(sourceDaysParam) || isNaN(limitParam) || daysParam <= 0 || sourceDaysParam <= 0 || limitParam <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid query parameters. Must be positive integers.' }), { status: 400, headers });
  }

  const cache = caches.default;
  const cacheKeyRequest = new Request(request.url, request); // Use the original request for cache key
  const cachedResponse = await cache.match(cacheKeyRequest);
  if (cachedResponse) {
    console.log('Serving news data from cache for URL:', request.url);
    return cachedResponse;
  }
  console.log('No cache hit for news data, fetching from D1 for URL:', request.url);


  try {
    const db = env.NEWS_DB;

    // --- Query for articles read by day ---
    let articlesByDayStmt = stmts.get('articlesByDay');
    if (!articlesByDayStmt) {
      articlesByDayStmt = db.prepare(`
        SELECT DATE(clicked_at) as date, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', ?1)
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
        WHERE clicked_at >= DATE('now', ?1)
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
        WHERE clicked_at >= DATE('now', ?1)
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
        LIMIT ?1
      `);
      stmts.set('recentArticles', recentArticlesStmt);
    }

    // Bind parameters and execute queries
    const articlesByDayPromise = articlesByDayStmt.bind(`-${daysParam} days`).all();
    const articlesBySourcePromise = articlesBySourceStmt.bind(`-${sourceDaysParam} days`).all();
    const articlesByHourPromise = articlesByHourStmt.bind(`-${sourceDaysParam} days`).all();
    const recentArticlesPromise = recentArticlesStmt.bind(limitParam).all();
    
    console.log('Executing D1 queries for news data...');
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
    console.log('D1 queries completed.');

    const responsePayload = {
      articlesByDay: articlesByDayResults.results || [],
      articlesBySource: articlesBySourceResults.results || [],
      articlesByHour: articlesByHourResults.results ? articlesByHourResults.results.map(r => ({...r, hour: parseInt(r.hour,10)})) : [],
      recentArticles: recentArticlesResults.results || [],
    };

    const response = new Response(JSON.stringify(responsePayload), { headers });
    waitUntil(cache.put(cacheKeyRequest, response.clone()));
    console.log('News data response constructed and cached.');
    return response;

  } catch (e) {
    // 2. This console.error will appear in your Cloudflare Worker logs
    console.error('Error fetching news data from D1:', e.message, e.stack, e.cause); 
    return new Response(JSON.stringify({ error: 'Failed to fetch news data from D1', details: e.message }), { status: 500, headers });
  }
}