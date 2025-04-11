// functions/api/running.js
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

  // Create cache key
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    console.log('Serving Running data from cache');
    return cachedResponse;
  }

  try {
    if (!env.DB) {
      throw new Error('Database binding not found');
    }

    // Check if the running_data table exists
    const tableExists = await checkTableExists(env.DB, 'running_data');
    
    if (!tableExists) {
      // If table doesn't exist, generate a year of mock data
      const mockData = generateMockRunningData(365);
      return new Response(JSON.stringify(mockData), { headers });
    }

    // Get up to 365 days of data (a full year)
    console.log('Querying Running data...');
    const data = await env.DB.prepare(`
      SELECT * FROM running_data 
      WHERE date >= datetime('now', '-365 days')
      ORDER BY date DESC
    `).all();

    if (!data || !data.results) {
      throw new Error('Failed to retrieve data from database');
    }

    console.log('Running data retrieved:', data.results.length, 'records');
    
    // Process data to handle null values and add formatting
    const formattedData = data.results;
    
    let lastValidFiveKSeconds = null;
    let lastValidVo2Max = null;
    
    // First pass - find most recent non-null values
    for (const record of formattedData) {
      if (record.five_k_seconds !== null && record.five_k_seconds !== undefined) {
        if (lastValidFiveKSeconds === null) {
          lastValidFiveKSeconds = record.five_k_seconds;
        }
        record.five_k_formatted = formatSecondsToMMSS(record.five_k_seconds);
      }
      
      if (record.vo2_max !== null && record.vo2_max !== undefined) {
        if (lastValidVo2Max === null) {
          lastValidVo2Max = record.vo2_max;
        }
      }
    }
    
    // Second pass - fill in null values with most recent valid values
    for (const record of formattedData) {
      if (record.five_k_seconds === null || record.five_k_seconds === undefined) {
        if (lastValidFiveKSeconds !== null) {
          record.five_k_seconds = lastValidFiveKSeconds;
          record.five_k_formatted = formatSecondsToMMSS(lastValidFiveKSeconds);
          record.is_fill_value_5k = true;
        }
      }
      
      if (record.vo2_max === null || record.vo2_max === undefined) {
        if (lastValidVo2Max !== null) {
          record.vo2_max = lastValidVo2Max;
          record.is_fill_value_vo2 = true;
        }
      }
    }
    
    const response = new Response(JSON.stringify(formattedData || []), { headers });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    console.error('Error in Running API:', error);
    
    // Generate a year of mock data if there's an error
    const mockData = generateMockRunningData(365);
    return new Response(JSON.stringify(mockData), { headers });
  }
}

// Helper function to check if a table exists
async function checkTableExists(db, tableName) {
  try {
    const result = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).bind(tableName).all();
    
    return result && result.results && result.results.length > 0;
  } catch (error) {
    console.error('Error checking table exists:', error);
    return false;
  }
}

// Helper function to format seconds to MM:SS
function formatSecondsToMMSS(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to generate mock running data
function generateMockRunningData(days) {
  const data = [];
  const baseVo2Max = 42.5;
  const base5kTimeSeconds = 1518;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const randomVariation = () => (Math.random() - 0.5) * 30;
    const seconds = base5kTimeSeconds + (i * 6) + randomVariation();
    
    data.push({
      date: date.toISOString(),
      vo2_max: baseVo2Max - (i * 0.1) + ((Math.random() - 0.5) * 0.5),
      five_k_seconds: seconds,
      five_k_formatted: formatSecondsToMMSS(seconds)
    });
  }
  
  return data;
}