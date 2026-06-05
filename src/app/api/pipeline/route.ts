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

function categorize(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase()
  if (text.includes('research') || text.includes('paper') || text.includes('study') || text.includes('arxiv')) return 'Research'
  if (text.includes('policy') || text.includes('regulation') || text.includes('government') || text.includes('law')) return 'Policy'
  if (text.includes('safety') || text.includes('alignment') || text.includes('risk')) return 'Safety'
  if (text.includes('startup') || text.includes('funding') || text.includes('raised') || text.includes('acquisition')) return 'Industry'
  return 'AI'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch articles from RSS feeds
    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const sourceName = feed.title || feedUrl
        const items = (feed.items || []).slice(0, 5).map(item => ({
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

    if (allItems.length === 0) {
      return NextResponse.json({ error: 'No articles fetched' }, { status: 500 })
    }

    // Ask Claude to curate and summarize
    const articleList = allItems
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

Select the 6 most significant articles. For each, write a 2-3 sentence summary in Techlomerate's voice: clear, honest, no breathlessness, no hype. Then estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1) based on the emotional and semantic content.

Respond in this exact JSON format:
{
  "articles": [
    {
      "title": "exact original title",
      "summary": "your 2-3 sentence summary",
      "source_url": "exact url",
      "source_name": "source name",
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

    // Write to Supabase
    const articlesToInsert = curated.articles.map((article: {
      title: string
      summary: string
      source_url: string
      source_name: string
      valence: number
      arousal: number
      dominance: number
    }, index: number) => ({
      title: article.title,
      summary: article.summary,
      source_url: article.source_url,
      source_name: article.source_name,
      category: categorize(article.title, article.summary),
      status: 'pending',
      featured: index === 0,
      published_at: new Date().toISOString(),
      valence: article.valence,
      arousal: article.arousal,
      dominance: article.dominance,
    }))

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
