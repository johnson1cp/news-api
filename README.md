# News Aggregator API

A serverless API that aggregates news from multiple sources, enriches with AI analysis, and caches results.

## Sources

- **Finnhub** - Financial news
- **Polygon** - Market news with sentiment
- **RSS Feeds** - Configurable RSS sources

## Features

- Aggregation & deduplication
- AI enrichment (summary, sentiment, categorization)
- Caching with TTL (Vercel KV)
- Scheduled refresh (Vercel Cron)

## Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your API keys

3. In Vercel Dashboard:
   - Add KV store (Storage → KV → Create)
   - Add environment variables
   - Cron jobs auto-configure from `vercel.json`

4. Deploy:
   ```bash
   vercel
   ```

## API Endpoints

### GET /api/news

Returns aggregated news.

Query params:
- `source` - Filter by source: `finnhub`, `polygon`, `rss`
- `refresh=true` - Force fresh fetch (skip cache)
- `enrich=true` - Trigger AI enrichment

Example:
```
GET /api/news
GET /api/news?source=polygon
GET /api/news?refresh=true&enrich=true
```

### GET /api/news/refresh

Cron endpoint - fetches and enriches news, updates cache.
Runs every 15 minutes (configurable in `vercel.json`).

## Response Format

```json
{
  "success": true,
  "cached": true,
  "count": 45,
  "data": [
    {
      "id": "polygon-abc123",
      "source": "polygon",
      "publisher": "Benzinga",
      "title": "Article Title",
      "summary": "Article summary...",
      "url": "https://...",
      "imageUrl": "https://...",
      "publishedAt": "2026-01-20T12:00:00Z",
      "tickers": ["AAPL", "MSFT"],
      "sentiment": "positive",
      "aiSummary": "AI-generated summary",
      "aiCategory": "markets"
    }
  ]
}
```

## Local Development

```bash
npm run dev
```

Requires Vercel CLI and linked project for KV access.
