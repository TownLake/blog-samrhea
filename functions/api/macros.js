// functions/api/macros.js

const stmts = new Map();

// Helper function to check if a table exists
async function checkTableExists(db, tableName) {
  try {
    const { results } = await db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name=?
    `).bind(tableName).all();
    return results.length > 0;
  } catch (e) {
    console.error(`Error checking if table ${tableName} exists:`, e);
    return false;
  }
}

// Mock data generation for daily_macros
function generateMockMacros(days) {
  const data = [];
  // Base values around your dietary goals
  const baseCalories = 2200;
  const baseProtein = 165;
  const baseCarbs = 248;
  const baseFat = 61;
  const baseSugar = 40; // a bit under the limit
  const baseSatFat = 15; // a bit under the limit

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      calories_kcal: Math.round(baseCalories + (Math.random() - 0.5) * 400),
      protein_g: +(baseProtein + (Math.random() - 0.5) * 30).toFixed(1),
      carbs_g: +(baseCarbs + (Math.random() - 0.5) * 50).toFixed(1),
      fat_g: +(baseFat + (Math.random() - 0.5) * 20).toFixed(1),
      fiber_g: +(30 + (Math.random() - 0.5) * 10).toFixed(1),
      sugar_g: +(baseSugar + (Math.random() - 0.5) * 20).toFixed(1),
      cholesterol_mg: +(250 + (Math.random() - 0.5) * 100).toFixed(1),
      sat_fat_g: +(baseSatFat + (Math.random() - 0.5) * 10).toFixed(1),
    });
  }
  return data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending
}


export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days') || '365';
  const days = parseInt(daysParam, 10);

  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    console.log(`Serving Macros (${daysParam}d) from cache`);
    return cachedResponse;
  }

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding not configured' }), { status: 500, headers });
    }

    const tableName = 'daily_macros';
    const tableExists = await checkTableExists(env.DB, tableName);

    if (!tableExists) {
      console.warn(`Table '${tableName}' not found. Serving mock data.`);
      const mockData = generateMockMacros(days);
      const mockResponse = new Response(JSON.stringify(mockData), { headers });
      waitUntil(cache.put(cacheKey, mockResponse.clone()));
      return mockResponse;
    }

    let stmt = stmts.get(daysParam);
    if (!stmt) {
      stmt = env.DB.prepare(`
        SELECT
          date,
          calories_kcal,
          protein_g,
          carbs_g,
          fat_g,
          fiber_g,
          sugar_g,
          cholesterol_mg,
          sat_fat_g
        FROM ${tableName}
        WHERE date >= date('now', '-${daysParam} days')
        ORDER BY date DESC
      `);
      stmts.set(daysParam, stmt);
    }

    const { results } = await stmt.all();
    console.log(`Macros → ${results.length} rows from DB for ${daysParam} days`);

    // Since the schema is NOT NULL, we don't need the two-pass fill logic here.

    const body = JSON.stringify(results);
    const response = new Response(body, { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;

  } catch (err) {
    console.error('Error in Macros API:', err.message, err.stack);
    // Return mock data on error to keep the frontend functional
    const mockData = generateMockMacros(days);
    return new Response(JSON.stringify(mockData), { status: 500, headers });
  }
}