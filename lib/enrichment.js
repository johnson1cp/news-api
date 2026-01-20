import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function enrichArticle(article) {
  // Skip if already has sentiment from source (like Polygon)
  if (article.sentiment && article.aiSummary) {
    return article;
  }

  try {
    const prompt = `Analyze this news article and provide:
1. A one-sentence summary (max 100 chars)
2. Sentiment: positive, negative, or neutral
3. Category: one of [markets, earnings, crypto, economy, politics, tech, other]
4. Key tickers mentioned (stock symbols only)

Article Title: ${article.title}
Article Summary: ${article.summary || 'N/A'}

Respond in JSON format only:
{
  "aiSummary": "...",
  "sentiment": "...",
  "category": "...",
  "extractedTickers": ["..."]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const analysis = JSON.parse(text);

    return {
      ...article,
      aiSummary: analysis.aiSummary,
      sentiment: article.sentiment || analysis.sentiment,
      aiCategory: analysis.category,
      tickers: [...new Set([...(article.tickers || []), ...(analysis.extractedTickers || [])])],
      enrichedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Enrichment error:', error);
    return {
      ...article,
      enrichmentError: true,
    };
  }
}

export async function enrichArticles(articles, limit = 10) {
  // Only enrich articles that haven't been enriched yet
  const toEnrich = articles.filter(a => !a.enrichedAt).slice(0, limit);
  const alreadyEnriched = articles.filter(a => a.enrichedAt);

  // Process in batches to avoid rate limits
  const enriched = [];
  for (const article of toEnrich) {
    const result = await enrichArticle(article);
    enriched.push(result);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return [...enriched, ...alreadyEnriched];
}
