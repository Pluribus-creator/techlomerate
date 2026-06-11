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

const ROBOTICS_FEEDS = [
  'https://spectrum.ieee.org/feeds/topic/robotics.rss',
  'https://www.therobotreport.com/feed/',
  'https://techcrunch.com/tag/robotics/feed/',
  'https://www.theverge.com/rss/robot/index.xml',
  'https://venturebeat.com/category/robotics/feed/',
  'https://www.engadget.com/rss.xml',
  'https://arstechnica.com/tag/robotics/feed/',
  'https://www.wired.com/feed/tag/robots/latest/rss',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: existingArticles } = await supabase
      .from('robotics_articles')
      .select('source_url')

    const existingUrls = new Set(
      (existingArticles || []).map((a: { source_url: string }) => a.source_url).filter(Boolean)
    )

    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of ROBOTICS_FEEDS) {
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
        content: `You are the editorial AI for Definitely Not Skynet, the robotics and embodied-AI desk of Techlomerate. The desk covers intelligence leaving the screen and entering the physical world — humanoid robots, industrial automation, embodied AI research, and the human stakes of all of it: labor, dignity, what it means when machines get a body. The voice is honest and unhurried, neither breathless techno-optimism nor reflexive doom. The name is a wink at the reflex everyone has — "wait, are you building Skynet?" — and the desk's whole posture is the answer: no, we are paying attention precisely so it isn't. Walt Whitman's "I Sing the Body Electric" is the quiet soul underneath the joke.

Here are today's candidate articles:

${articleList}

Select the 6 most significant. Prioritize:
- Humanoid robot development (Figure, Tesla Optimus, Agility, Boston Dynamics, Unitree, etc.)
- Industrial and warehouse automation with real deployment
- Embodied AI and robot learning research
- Labor, economic, and social implications of automation
- Surgical, assistive, and prosthetic robotics
- Policy, safety, and governance of physical AI systems

For each:
1. Write a 2-3 sentence summary in the desk's voice: grounded, curious about both the engineering and the human stakes, never sensational.
2. Assign a category: Humanoids, Industrial, Research, Labor, Embodiment, Policy
3. Estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

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
        valence: article.valence,
        arousal: article.arousal,
        dominance: article.dominance,
      }))

    if (articlesToInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'All articles already exist' })
    }

    const { data, error } = await supabase
      .from('robotics_articles')
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
    console.error('Robotics pipeline error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
