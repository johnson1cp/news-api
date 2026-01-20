import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail'],
  },
});

// Example RSS feeds - add your own
const RSS_FEEDS = [
  { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
  // Add more feeds as needed
];

export async function fetchRSSNews(feedUrls = RSS_FEEDS) {
  const allArticles = [];

  for (const feed of feedUrls) {
    try {
      const parsed = await parser.parseURL(feed.url);

      const articles = parsed.items.slice(0, 10).map((item, index) => ({
        id: `rss-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        source: 'rss',
        publisher: feed.name,
        title: item.title,
        summary: item.contentSnippet || item.content?.slice(0, 300),
        url: item.link,
        imageUrl: item['media:content']?.$.url || item['media:thumbnail']?.$.url || null,
        publishedAt: item.isoDate || item.pubDate,
        categories: item.categories || [],
        tickers: [], // RSS doesn't typically have tickers
      }));

      allArticles.push(...articles);
    } catch (error) {
      console.error(`RSS fetch error for ${feed.name}:`, error);
    }
  }

  return allArticles;
}

export { RSS_FEEDS };
