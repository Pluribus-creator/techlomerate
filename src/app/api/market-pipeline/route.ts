import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const parser = new Parser()

const MARKET_FEEDS = [
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
  'https://feeds.reuters.com/reuters/businessNews',
  'https://feeds.bloomberg.com/markets/news.rss',
  'https://www.cnbc.com/id/10000664/device/rss/rss.html',
  'https://feeds.marketwatch.com/marketwatch/topstories/',
  'https://www.barrons.com/xml/rss/3_7510.xml',
  'https://finance.yahoo.com/news/rssindex',
  'https://feeds.a.dj.com/rss/RSSWSJD.xml',
  'https://www.ft.com/companies/technology?format=rss',
  'https://techcrunch.com/category/venture/feed/',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: existingArticles } = await supabase
      .from('market_articles')
      .select('source_url')

    const existingUrls = new Set(
      (existingArticles || []).map((a: { source_url: string }) => a.source_url).filter(Boolean)
    )

    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of MARKET_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const sourceName = feed.title || feedUrl
        const items = (feed.items || []).slice(0, 6).map(item => ({
          title: item.title || '',
          link: item.link || '',
          sourceName,
          content: item.contentSnippet || item.summary || '',
        }))
        allItems.push(...items)
      } catch {
        console.log(`Failed to fetch feed: ${feedUrl}`)
      }
    }

    const newItems = allItems.filter(item => item.link && !existingUrls.has(item.link))

    if (newItems.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'No new articles found' })
    }

    const articleList = newItems
      .map((item, i) => `${i + 1}. ${item.title}\nSource: ${item.sourceName}\nURL: ${item.link}\nSnippet: ${item.content}`)
      .join('\n\n')

    const curationResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are the editorial AI for The Old Market, the investment desk of Techlomerate. The Old Market covers AI and technology through the lens of patient capital — long time horizons, fundamental analysis, honest assessment. It is not a trading desk. It does not chase momentum. It watches the infrastructure underneath the intelligence.

Here are today's candidate articles:

${articleList}

Select the 6 most relevant articles for an AI-focused investor with a long time horizon. Prioritize:
- AI company earnings, guidance, and financials
- Infrastructure investment (compute, data centers, semiconductors)
- Significant VC rounds and valuations
- Market-moving policy or regulatory developments
- Technology breakthroughs with clear commercial implications
- Macro conditions affecting AI capital allocation

For each selected article:
1. Write a 2-3 sentence summary in The Old Market voice: measured, patient, no breathlessness. What does this mean for capital over five years, not five minutes.
2. Assign a category: Earnings, Infrastructure, Venture, Policy, Macro, Research
3. Identify the most relevant stock ticker if applicable (e.g. NVDA, MSFT, GOOG) or null if none
4. Estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

Respond in this exact JSON format:
{
  "articles": [
    {
      "title": "exact original title",
      "summary": "your 2-3 sentence summary",
      "source_url": "exact url",
      "source_name": "source name",
      "category": "category",
      "ticker": "TICKER or null",
      "valence": 0.0,
      "arousal": 0.0,
      "dominance": 0.0
    }
  ]
}`
      }]
    })

    const responseText = curationResponse.content[0].type === 'text'
      ? curationResponse.content[0].text
      : ''

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse Claude response' }, { status: 500 })
    }

    const curated = JSON.parse(jsonMatch[0])

    const articlesToInsert = curated.articles
      .filter((article: { source_url: string }) => !existingUrls.has(article.source_url))
      .map((article: {
        title: string
        summary: string
        source_url: string
        source_name: string
        category: string
        ticker: string | null
        valence: number
        arousal: number
        dominance: number
      }, index: number) => ({
        title: article.title,
        summary: article.summary,
        source_url: article.source_url,
        source_name: article.source_name,
        category: article.category,
        ticker: article.ticker || null,
        status: 'pending',
        featured: index === 0,
        published_at: new Date().toISOString(),
        valence: article.valence,
        arousal: article.arousal,
        dominance: article.dominance,
      }))

    if (articlesToInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'All articles already exist' })
    }

    const { data, error } = await supabase
      .from('market_articles')
      .insert(articlesToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
      articles: data,
    })

  } catch (error) {
    console.error('Market pipeline error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
