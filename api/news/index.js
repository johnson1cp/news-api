import { getCache, setCache, CACHE_KEYS, TTL } from '../../lib/cache.js';
import { fetchAllSources } from '../../lib/sources/index.js';
import { enrichArticles } from '../../lib/enrichment.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { source, refresh, enrich } = req.query;

    // Check cache first (unless refresh requested)
    if (refresh !== 'true') {
      const cached = await getCache(CACHE_KEYS.NEWS_ENRICHED);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          count: cached.length,
          data: filterBySource(cached, source),
        });
      }
    }

    // Fetch fresh data
    console.log('Fetching fresh news...');
    let articles = await fetchAllSources();

    // Optionally enrich with AI
    if (enrich === 'true') {
      console.log('Enriching articles with AI...');
      articles = await enrichArticles(articles, 10);
    }

    // Cache the results
    await setCache(CACHE_KEYS.NEWS_ENRICHED, articles, TTL.MEDIUM);

    return res.status(200).json({
      success: true,
      cached: false,
      count: articles.length,
      data: filterBySource(articles, source),
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

function filterBySource(articles, source) {
  if (!source) return articles;
  return articles.filter(a => a.source === source);
}
