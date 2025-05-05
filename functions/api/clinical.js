// functions/api/clinical.js

const stmts = new Map();

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

function generateMockClinicalData(days) {
  const baseVo2 = 45.2;
  const testFrequencyDays = 90;
  const numDataPoints = Math.ceil(days / testFrequencyDays);
  
  return Array.from({ length: numDataPoints }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i * testFrequencyDays));
    const variance = (Math.random() - 0.5) * 0.5;
    
    return {
      date: d.toISOString(),
      vo2_max_clinical: +(baseVo2 - i * 0.2 + variance).toFixed(1)
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
    'Cache-Control': 'public, max-age=3600'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days') || '365';
  const days = parseInt(daysParam, 10);

  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log(`Serving Clinical (${daysParam}d) from cache`);
    return cached;
  }

  try {
    if (!env.DB) throw new Error('DB binding not found');

    const exists = await checkTableExists(env.DB, 'clinical_data');
    if (!exists) {
      return new Response(JSON.stringify(generateMockClinicalData(days)), { headers });
    }

    let stmt = stmts.get(daysParam);
    if (!stmt) {
      stmt = env.DB.prepare(`
        SELECT date, vo2_max_clinical
        FROM clinical_data
        WHERE date >= datetime('now', '-${daysParam} days')
        ORDER BY date DESC
      `);
      stmts.set(daysParam, stmt);
    }

    const { results } = await stmt.all();

    const body = JSON.stringify(results);
    const response = new Response(body, { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;

  } catch (err) {
    console.error('Error in Clinical API:', err);
    return new Response(JSON.stringify(generateMockClinicalData(days)), { headers });
  }
}