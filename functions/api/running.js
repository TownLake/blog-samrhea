// functions/api/running.js

const stmts = new Map();

function formatSecondsToMMSS(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function checkTableExists(db, tableName) {
  try {
    const { results } = await db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name=?
    `).bind(tableName).all();
    return results.length > 0;
  } catch {
    return false;
  }
}

function generateMockRunningData(days) {
  const baseVo2 = 42.5;
  const base5k = 1518;
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const variation = () => (Math.random() - 0.5) * 30;
    const secs = base5k + i * 6 + variation();
    return {
      date: d.toISOString(),
      vo2_max: +(baseVo2 - i * 0.1 + (Math.random() - 0.5) * 0.5).toFixed(1),
      five_k_seconds: secs,
      five_k_formatted: formatSecondsToMMSS(secs)
    };
  });
}

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

  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days') || '365';
  const days = parseInt(daysParam, 10);

  // edge cache key
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log(`Serving Running (${daysParam}d) from cache`);
    return cached;
  }

  try {
    if (!env.DB) throw new Error('DB binding not found');

    // if table missing, return mock data
    const exists = await checkTableExists(env.DB, 'running_data');
    if (!exists) {
      return new Response(JSON.stringify(generateMockRunningData(days)), { headers });
    }

    // prepare & cache statement per window
    let stmt = stmts.get(daysParam);
    if (!stmt) {
      stmt = env.DB.prepare(`
        SELECT date, vo2_max, five_k_seconds
        FROM running_data
        WHERE date >= datetime('now', '-${daysParam} days')
        ORDER BY date DESC
      `);
      stmts.set(daysParam, stmt);
    }

    const { results } = await stmt.all();

    // two‑pass fill and format
    let last5k = null, lastVo2 = null;
    for (const r of results) {
      if (r.five_k_seconds != null) {
        last5k = last5k ?? r.five_k_seconds;
        r.five_k_formatted = formatSecondsToMMSS(r.five_k_seconds);
      }
      if (r.vo2_max != null) {
        lastVo2 = lastVo2 ?? r.vo2_max;
      }
    }
    for (const r of results) {
      if (r.five_k_seconds == null && last5k != null) {
        r.five_k_seconds = last5k;
        r.five_k_formatted = formatSecondsToMMSS(last5k);
        r.is_fill_value_5k = true;
      }
      if (r.vo2_max == null && lastVo2 != null) {
        r.vo2_max = lastVo2;
        r.is_fill_value_vo2 = true;
      }
    }

    const body = JSON.stringify(results);
    const response = new Response(body, { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;

  } catch (err) {
    console.error('Error in Running API:', err);
    // fallback to mock data
    return new Response(JSON.stringify(generateMockRunningData(days)), { headers });
  }
}
