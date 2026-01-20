import { setCache, CACHE_KEYS, TTL } from '../../lib/cache.js';
import { fetchAllSources } from '../../lib/sources/index.js';
import { enrichArticles } from '../../lib/enrichment.js';

export default async function handler(req, res) {
  // This endpoint is called by Vercel Cron
  // Verify it's a cron request in production
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development, reject in production without proper auth
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    console.log('Cron refresh started...');

    // Fetch from all sources
    let articles = await fetchAllSources();
    console.log(`Fetched ${articles.length} articles`);

    // Enrich top articles with AI
    articles = await enrichArticles(articles, 15);
    console.log('Enrichment complete');

    // Cache the results
    await setCache(CACHE_KEYS.NEWS_ENRICHED, articles, TTL.MEDIUM);
    await setCache(CACHE_KEYS.LAST_REFRESH, new Date().toISOString(), TTL.LONG);

    return res.status(200).json({
      success: true,
      message: 'Refresh complete',
      count: articles.length,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
