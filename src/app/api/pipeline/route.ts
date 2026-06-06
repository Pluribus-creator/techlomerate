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

const FEEDS = [
  'https://www.technologyreview.com/feed/',
  'https://venturebeat.com/category/ai/feed/',
  'https://openai.com/news/rss.xml',
  'https://www.deepmind.com/blog/rss.xml',
  'https://anthropic.com/news/rss.xml',
  'https://feeds.feedburner.com/TheAIAlignmentForum',
  'https://jack-clark.net/feed/',
  'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://wired.com/feed/tag/artificial-intelligence/rss',
  'https://www.reuters.com/technology/artificial-intelligence/rss',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  'https://feeds.a.dj.com/rss/RSSWSJD.xml',
  'https://spectrum.ieee.org/feeds/feed.rss',
  'https://www.thenationalnews.com/rss/technology',
  'https://restofworld.org/feed/',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('source_url')

    const existingUrls = new Set(
      (existingArticles || []).map(a => a.source_url).filter(Boolean)
    )

    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const sourceName = feed.title || feedUrl
        const items = (feed.items || []).slice(0, 8).map(item => ({
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
        content: `You are the editorial AI for Techlomerate, a thoughtful AI news publication with a contemplative, feminine aesthetic. It values intellectual rigor, human dignity, and honest reporting without hype.

Here are today's candidate articles:

${articleList}

Select the 6 most significant articles. For each:
1. Write a 2-3 sentence summary in Techlomerate's voice: clear, honest, no breathlessness, no hype
2. Assign a category from exactly these options: Research, Policy, Safety, Industry, AI, Ethics, Science
3. Estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

Category guidance:
- Research: academic papers, studies, new findings, arxiv
- Policy: regulation, government, law, governance, treaties
- Safety: AI safety, alignment, existential risk, misuse
- Industry: funding, startups, acquisitions, business strategy, earnings
- Ethics: bias, fairness, privacy, social impact, labor displacement
- Science: breakthroughs, technical advances, new capabilities
- AI: general AI news that doesn't fit the above

Respond in this exact JSON format:
{
  "articles": [
    {
      "title": "exact original title",
      "summary": "your 2-3 sentence summary",
      "source_url": "exact url",
      "source_name": "source name",
      "category": "one of the categories above",
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
        valence: number
        arousal: number
        dominance: number
      }, index: number) => ({
        title: article.title,
        summary: article.summary,
        source_url: article.source_url,
        source_name: article.source_name,
        category: article.category,
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
      .from('articles')
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
    console.error('Pipeline error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
