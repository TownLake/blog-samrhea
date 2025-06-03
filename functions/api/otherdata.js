// functions/api/otherdata.js

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

// Updated mock data generation
function generateMockOtherData(days) {
  const data = [];
  const basePeakFlow = 550;
  const baseStrongGrip = 50;
  const baseWeakGrip = 45;
  const basePowerBreathe = 4; // Base level for mock data

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      peak_flow: +(basePeakFlow + (Math.random() - 0.5) * 50).toFixed(1),
      strong_grip: +(baseStrongGrip + (Math.random() - 0.5) * 5).toFixed(1),
      weak_grip: +(baseWeakGrip + (Math.random() - 0.5) * 5).toFixed(1),
      power_breathe_level: +(basePowerBreathe + (Math.random() - 0.5) * 2).toFixed(1), // Added mock data
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
    'Cache-Control': 'public, max-age=300'
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
    console.log(`Serving OtherData (${daysParam}d) from cache`);
    return cachedResponse;
  }

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding not configured' }), { status: 500, headers });
    }

    const tableName = 'other_data';
    const tableExists = await checkTableExists(env.DB, tableName);

    if (!tableExists) {
      console.warn(`Table '${tableName}' not found. Serving mock data.`);
      const mockData = generateMockOtherData(days);
      const mockResponse = new Response(JSON.stringify(mockData), { headers });
      waitUntil(cache.put(cacheKey, mockResponse.clone()));
      return mockResponse;
    }

    let stmt = stmts.get(daysParam);
    if (!stmt) {
      // Updated SQL statement to include the new column
      stmt = env.DB.prepare(`
        SELECT
          date,
          peak_flow,
          strong_grip,
          weak_grip,
          power_breathe_level
        FROM ${tableName}
        WHERE date >= date('now', '-${daysParam} days')
        ORDER BY date DESC
      `);
      stmts.set(daysParam, stmt);
    }

    const { results } = await stmt.all();
    console.log(`OtherData → ${results.length} rows from DB for ${daysParam} days`);

    // Updated two-pass fill logic
    let lastPeakFlow = null, lastStrongGrip = null, lastWeakGrip = null, lastPowerBreathe = null;

    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.peak_flow != null) lastPeakFlow = lastPeakFlow ?? r.peak_flow;
        if (r.strong_grip != null) lastStrongGrip = lastStrongGrip ?? r.strong_grip;
        if (r.weak_grip != null) lastWeakGrip = lastWeakGrip ?? r.weak_grip;
        if (r.power_breathe_level != null) lastPowerBreathe = lastPowerBreathe ?? r.power_breathe_level;
    }
    
    const processedResults = results.map(r => {
        const filledRecord = { ...r };
        if (r.peak_flow == null && lastPeakFlow != null) {
            filledRecord.peak_flow = lastPeakFlow;
            filledRecord.is_fill_value_peak = true;
        }
        if (r.strong_grip == null && lastStrongGrip != null) {
            filledRecord.strong_grip = lastStrongGrip;
            filledRecord.is_fill_value_strong = true;
        }
        if (r.weak_grip == null && lastWeakGrip != null) {
            filledRecord.weak_grip = lastWeakGrip;
            filledRecord.is_fill_value_weak = true;
        }
        // Add fill logic for the new field
        if (r.power_breathe_level == null && lastPowerBreathe != null) {
            filledRecord.power_breathe_level = lastPowerBreathe;
            // The frontend will look for this key based on the dataKey 'power_breathe_level'
            filledRecord.is_fill_value_power_breathe = true; 
        }
        return filledRecord;
    });


    const body = JSON.stringify(processedResults);
    const response = new Response(body, { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;

  } catch (err) {
    console.error('Error in OtherData API:', err.message, err.stack);
    const mockData = generateMockOtherData(days);
    return new Response(JSON.stringify(mockData), { status: 500, headers });
  }
}