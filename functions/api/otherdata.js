// functions/api/otherdata.js

const stmts = new Map();

// Helper function to check if a table exists (can be reused or imported if you have a shared utils)
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

// Mock data generation if table doesn't exist (optional, but good for development)
function generateMockOtherData(days) {
  const data = [];
  const basePeakFlow = 550; // L/min
  const baseStrongGrip = 50; // kg
  const baseWeakGrip = 45;   // kg

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0], // Ensure YYYY-MM-DD format
      peak_flow: +(basePeakFlow + (Math.random() - 0.5) * 50).toFixed(1),
      strong_grip: +(baseStrongGrip + (Math.random() - 0.5) * 5).toFixed(1),
      weak_grip: +(baseWeakGrip + (Math.random() - 0.5) * 5).toFixed(1),
    });
  }
  return data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending for latest first
}


export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Adjust for production
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

  // Edge cache key
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' }); // Use full URL for unique cache key
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    console.log(`Serving OtherData (${daysParam}d) from cache`);
    return cachedResponse;
  }

  try {
    if (!env.DB) {
      console.error('DB binding not found');
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
      // Assuming your date column is named 'date' and is in a format SQLite can compare
      // Adjust 'date_column_name' if your date column in 'other_data' is different
      stmt = env.DB.prepare(`
        SELECT
          date,  -- Or your actual date column name
          peak_flow,
          strong_grip,
          weak_grip
        FROM ${tableName}
        WHERE date >= date('now', '-${daysParam} days')
        ORDER BY date DESC
      `);
      stmts.set(daysParam, stmt);
    }

    const { results } = await stmt.all();
    console.log(`OtherData → ${results.length} rows from DB for ${daysParam} days`);

    // Optional: Implement two-pass fill for missing values similar to your running.js
    // For simplicity, this is omitted here but consider adding if needed.
    // Example:
    let lastPeakFlow = null, lastStrongGrip = null, lastWeakGrip = null;

    // First pass: find the most recent non-null values
    // Iterate backwards if your results are DESC
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.peak_flow != null) lastPeakFlow = lastPeakFlow ?? r.peak_flow;
        if (r.strong_grip != null) lastStrongGrip = lastStrongGrip ?? r.strong_grip;
        if (r.weak_grip != null) lastWeakGrip = lastWeakGrip ?? r.weak_grip;
    }
    
    // Second pass: fill nulls and mark them
    const processedResults = results.map(r => {
        const filledRecord = { ...r };
        if (r.peak_flow == null && lastPeakFlow != null) {
            filledRecord.peak_flow = lastPeakFlow;
            filledRecord.is_fill_value_peak = true;
        }
        if (r.strong_grip == null && lastStrongGrip != null) {
            filledRecord.strong_grip = lastStrongGrip;
            filledRecord.is_fill_value_strong = true; // consistent naming with other files is_fill_value_METRICKEY_PREFIX
        }
        if (r.weak_grip == null && lastWeakGrip != null) {
            filledRecord.weak_grip = lastWeakGrip;
            filledRecord.is_fill_value_weak = true; // consistent naming
        }
        return filledRecord;
    });


    const body = JSON.stringify(processedResults);
    const response = new Response(body, { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;

  } catch (err) {
    console.error('Error in OtherData API:', err.message, err.stack);
    // Fallback to mock data on error as well
    const mockData = generateMockOtherData(days);
    return new Response(JSON.stringify(mockData), { status: 500, headers }); // return 500 for actual errors
  }
}