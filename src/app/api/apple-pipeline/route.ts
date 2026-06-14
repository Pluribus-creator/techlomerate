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

const APPLE_FEEDS = [
  'https://9to5mac.com/feed/',
  'https://www.macrumors.com/macrumors.xml',
  'https://appleinsider.com/rss/news/',
  'https://www.theverge.com/apple/rss/index.xml',
  'https://www.cultofmac.com/feed/',
  'https://MacStories.net/feed/',
  'https://daringfireball.net/feeds/main',
  'https://sixcolors.com/feed/',
  'https://www.macworld.com/feed',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: existingArticles } = await supabase
      .from('apple_articles')
      .select('source_url')

    const existingUrls = new Set(
      (existingArticles || []).map((a: { source_url: string }) => a.source_url).filter(Boolean)
    )

    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of APPLE_FEEDS) {
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
        content: `You are the editorial AI for One Recursive Loop, the Apple desk of Techlomerate. One Recursive Loop covers Apple with the same honest, unhurried voice as the rest of the publication — no fanboy breathlessness, no reflexive criticism. Apple is covered as what it actually is: the company that has thought harder than anyone about the relationship between humans and their tools, and whose decisions affect a billion people.

Here are today's candidate articles:

${articleList}

Select the 6 most significant articles. Prioritize:
- Product announcements and genuine hardware/software advances
- AI integration into Apple products (Apple Intelligence, Siri, on-device ML)
- Design and human interface decisions
- Privacy and security developments
- Business strategy and market position
- WWDC announcements and developer news

For each:
1. Write a 2-3 sentence summary in One Recursive Loop's voice: thoughtful, precise, genuinely curious about what Apple's choices mean for how people relate to their devices.
2. Assign a category: Hardware, Software, AI, Privacy, Design, Business, Developer
3. Estimate rough affect (model estimate, not measurement) (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

Respond in this exact JSON format:
{
  "articles": [
    {
      "title": "exact original title",
      "summary": "your 2-3 sentence summary",
      "source_url": "exact url",
      "source_name": "source name",
      "category": "category",
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
        llm_valence_est: article.valence,
        llm_arousal_est: article.arousal,
        llm_dominance_est: article.dominance,
      }))

    if (articlesToInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'All articles already exist' })
    }

    const { data, error } = await supabase
      .from('apple_articles')
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
    console.error('Apple pipeline error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
