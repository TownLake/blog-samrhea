// functions/api/news.js

// Helper to get cached statements (optional, good for performance)
const stmts = new Map();

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

  if (!env.NEWS_DB) {
    console.error('NEWS_DB binding not found');
    return new Response(JSON.stringify({ error: 'Database binding not configured for news' }), { status: 500, headers });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days') || '90'; // Default to 90 days for charts
  const sourceDaysParam = url.searchParams.get('sourceDays') || '30'; // Default to 30 days for source/hour stats
  const limitParam = url.searchParams.get('limit') || '5'; // Default to 5 for recent articles

  // Edge cache
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
    let articlesByDayStmt = stmts.get(`articlesByDay_${daysParam}`);
    if (!articlesByDayStmt) {
      articlesByDayStmt = db.prepare(`
        SELECT DATE(clicked_at) as date, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', '-${daysParam} days')
        GROUP BY DATE(clicked_at)
        ORDER BY DATE(clicked_at) ASC
      `);
      stmts.set(`articlesByDay_${daysParam}`, articlesByDayStmt);
    }

    // --- Query for articles read by source ---
    let articlesBySourceStmt = stmts.get(`articlesBySource_${sourceDaysParam}`);
    if (!articlesBySourceStmt) {
      articlesBySourceStmt = db.prepare(`
        SELECT source, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', '-${sourceDaysParam} days')
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10 -- Show top 10 sources
      `);
      stmts.set(`articlesBySource_${sourceDaysParam}`, articlesBySourceStmt);
    }

    // --- Query for articles read by time of day (hour) ---
    let articlesByHourStmt = stmts.get(`articlesByHour_${sourceDaysParam}`);
    if (!articlesByHourStmt) {
      articlesByHourStmt = db.prepare(`
        SELECT STRFTIME('%H', clicked_at) as hour, COUNT(*) as count
        FROM news
        WHERE clicked_at >= DATE('now', '-${sourceDaysParam} days')
        GROUP BY STRFTIME('%H', clicked_at)
        ORDER BY hour ASC
      `);
      stmts.set(`articlesByHour_${sourceDaysParam}`, articlesByHourStmt);
    }
    
    // --- Query for 5 most recent articles ---
    let recentArticlesStmt = stmts.get(`recentArticles_${limitParam}`);
    if (!recentArticlesStmt) {
      recentArticlesStmt = db.prepare(`
        SELECT link, headline, source, clicked_at
        FROM news
        ORDER BY clicked_at DESC
        LIMIT ${parseInt(limitParam, 10)}
      `);
      stmts.set(`recentArticles_${limitParam}`, recentArticlesStmt);
    }

    // Execute all queries concurrently
    const [
      articlesByDayResults,
      articlesBySourceResults,
      articlesByHourResults,
      recentArticlesResults
    ] = await Promise.all([
      articlesByDayStmt.all(),
      articlesBySourceStmt.all(),
      articlesByHourStmt.all(),
      recentArticlesStmt.all()
    ]);

    const responsePayload = {
      articlesByDay: articlesByDayResults.results || [],
      articlesBySource: articlesBySourceResults.results || [],
      articlesByHour: articlesByHourResults.results ? articlesByHourResults.results.map(r => ({...r, hour: parseInt(r.hour,10)})) : [], // Ensure hour is number
      recentArticles: recentArticlesResults.results || [],
    };

    const response = new Response(JSON.stringify(responsePayload), { headers });
    waitUntil(cache.put(cacheKeyRequest, response.clone()));
    return response;

  } catch (e) {
    console.error('Error fetching news data:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch news data', details: e.message }), { status: 500, headers });
  }
}