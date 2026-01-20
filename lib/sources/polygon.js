const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io/v2';

export async function fetchPolygonNews(limit = 20) {
  try {
    const response = await fetch(
      `${BASE_URL}/reference/news?order=desc&limit=${limit}&sort=published_utc&apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    // Normalize to common format
    return (data.results || []).map(item => ({
      id: `polygon-${item.id}`,
      source: 'polygon',
      publisher: item.publisher?.name,
      publisherLogo: item.publisher?.logo_url,
      title: item.title,
      summary: item.description,
      url: item.article_url,
      imageUrl: item.image_url,
      publishedAt: item.published_utc,
      keywords: item.keywords || [],
      tickers: item.tickers || [],
      sentiment: item.insights?.[0]?.sentiment || null,
      sentimentReasoning: item.insights?.[0]?.sentiment_reasoning || null,
    }));
  } catch (error) {
    console.error('Polygon fetch error:', error);
    return [];
  }
}
