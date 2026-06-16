// src/app/api/thirst-pipeline/route.ts
// The Thirst — gear / consumer-tech desk.
// Cloned from /api/pipeline, adapted: gear feeds, thirst_articles table,
// Thirst editorial voice, gear categories, reader_mode.
//
// FIREWALL: this route never writes has_affiliate / affiliate_url / verdict.
// Affiliate links and the buy/skip call are added by a human at curation — so
// ingest is structurally incapable of putting money on a page. By design.

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

// Verified active 2026-06-16: verge, engadget, 9to5mac, ars, toms guide.
// The rest follow each site's standard feed pattern; the try/catch below
// silently skips any that 404, same as your other desks. Watch iFixit,
// DPReview, Notebookcheck on the first run — they move more than the others.
const FEEDS = [
  // the adopter lane — buy-the-new-thing
  'https://www.theverge.com/rss/index.xml',
  'https://www.engadget.com/rss.xml',
  'https://9to5mac.com/feed',
  'https://9to5google.com/feed',
  'https://www.androidauthority.com/feed/',
  'https://sixcolors.com/feed/',
  // the stretcher lane — depth, value, longevity
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.macstories.net/feed/',
  'https://www.tomshardware.com/feeds.xml',
  'https://www.notebookcheck.net/News.152.0.html?type=rss',
  // the spine — own it, repair it, make it last
  'https://www.ifixit.com/News/rss',
  'https://hackaday.com/feed/',
  'https://www.dpreview.com/feeds/news.xml',
  // the buying / sugar-rush
  'https://www.tomsguide.com/feeds.xml',
  'https://9to5toys.com/feed',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: existingArticles } = await supabase
      .from('thirst_articles')
      .select('source_url')

    const existingUrls = new Set(
      (existingArticles || []).map(a => a.source_url).filter(Boolean)
    )

    const allItems: { title: string; link: string; sourceName: string; content: string }[] = []

    for (const feedUrl of FEEDS) {
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
      model: 'claude-sonnet-4-6', // claude-sonnet-4-20250514 was RETIRED June 15 2026 — update your other desks to this string too
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are the editorial AI for The Thirst, the consumer-tech and gear desk of Techlomerate. The Thirst covers the stuff people actually carry and use — phones, computers, audio, wearables, cameras, AI hardware, smart home, gaming, and the gear worth caring about.

Voice: playful, warm, honest, a little self-aware. Desire is allowed here — wanting the new thing is not a sin, and neither is keeping what you own for a decade. NEVER moralize about how anyone spends their money. No hype, no breathless "best ever," no fake urgency, no envy dressed up as wisdom.

You honor two readers equally:
- the adopter, who buys the new thing for the joy of it
- the stretcher, who makes gear last judiciously to save money
Both are completely valid. When something is overhyped or not worth it, say so plainly — "skip it" and "the one you have is fine" are honest, welcome answers.

Here are today's candidate articles:

${articleList}

Select the 6 most significant. Prioritise genuine product news, reviews, launches, meaningful updates, repairability/ownership stories, and real deals over rumour-churn, spec-sheet filler, and promotional fluff. For each:
1. Write a 2-3 sentence summary in The Thirst's voice: clear, honest, a little fun, no hype
2. Assign a category from exactly these options: Phones, Computers, Audio, Wearables, Cameras, AI Hardware, Smart Home, Gaming, Repair, Deals
3. Assign reader_mode from exactly these options: adopter, stretcher, both
   - adopter = mainly for the buy-the-new-thing reader
   - stretcher = mainly for the make-it-last / value reader
   - both = matters either way
4. Estimate rough affect (model estimate, not measurement) (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

Do NOT assign a buy/skip verdict — that is a human editorial call made at curation, not from a snippet.

Respond in this exact JSON format:
{
  "articles": [
    {
      "title": "exact original title",
      "summary": "your 2-3 sentence summary",
      "source_url": "exact url",
      "source_name": "source name",
      "category": "one of the categories above",
      "reader_mode": "adopter | stretcher | both",
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
        reader_mode: string
        valence: number
        arousal: number
        dominance: number
      }, index: number) => ({
        title: article.title,
        summary: article.summary,
        source_url: article.source_url,
        source_name: article.source_name,
        category: article.category,
        reader_mode: article.reader_mode,
        status: 'pending',
        featured: index === 0,
        published_at: new Date().toISOString(),
        llm_valence_est: article.valence,
        llm_arousal_est: article.arousal,
        llm_dominance_est: article.dominance,
        // verdict, has_affiliate, affiliate_url intentionally NOT set here —
        // they default (null / false / null) and are written only by a human.
      }))

    if (articlesToInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'All articles already exist' })
    }

    const { data, error } = await supabase
      .from('thirst_articles')
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
    console.error('Thirst pipeline error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
