const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchFinnhubNews(category = 'general') {
  try {
    const response = await fetch(
      `${BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    // Normalize to common format
    return data.slice(0, 20).map(item => ({
      id: `finnhub-${item.id}`,
      source: 'finnhub',
      publisher: item.source,
      title: item.headline,
      summary: item.summary,
      url: item.url,
      imageUrl: item.image,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      category: item.category,
      tickers: item.related ? item.related.split(',') : [],
    }));
  } catch (error) {
    console.error('Finnhub fetch error:', error);
    return [];
  }
}
