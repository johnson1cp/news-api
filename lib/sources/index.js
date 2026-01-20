import { fetchFinnhubNews } from './finnhub.js';
import { fetchPolygonNews } from './polygon.js';
import { fetchRSSNews } from './rss.js';

export async function fetchAllSources() {
  // Fetch from all sources in parallel
  const [finnhubNews, polygonNews, rssNews] = await Promise.all([
    fetchFinnhubNews(),
    fetchPolygonNews(),
    fetchRSSNews(),
  ]);

  // Combine all articles
  const allArticles = [...finnhubNews, ...polygonNews, ...rssNews];

  // Deduplicate by URL
  const seen = new Set();
  const deduped = allArticles.filter(article => {
    if (seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });

  // Sort by publish date (newest first)
  deduped.sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB - dateA;
  });

  return deduped;
}

export async function fetchFromSource(sourceName) {
  switch (sourceName) {
    case 'finnhub':
      return fetchFinnhubNews();
    case 'polygon':
      return fetchPolygonNews();
    case 'rss':
      return fetchRSSNews();
    default:
      throw new Error(`Unknown source: ${sourceName}`);
  }
}

export { fetchFinnhubNews, fetchPolygonNews, fetchRSSNews };
