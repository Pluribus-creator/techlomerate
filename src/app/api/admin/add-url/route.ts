import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const deskConfig = {
  main: { table: 'articles', voice: 'Techlomerate, a thoughtful AI news publication. Clear, honest, no hype.', categories: 'Research, Policy, Safety, Industry, Ethics, Science, AI' },
  apple: { table: 'apple_articles', voice: 'One Recursive Loop, the Apple desk of Techlomerate. Thoughtful, precise, genuinely curious about what Apple choices mean for how people relate to their devices.', categories: 'Hardware, Software, AI, Privacy, Design, Business, Developer' },
  market: { table: 'market_articles', voice: 'The Old Market, the investment desk of Techlomerate. Measured, patient, long time horizons.', categories: 'Earnings, Infrastructure, Venture, Policy, Macro, Research' },
  robotics: { table: 'robotics_articles', voice: 'Definitely Not Skynet, the robotics and embodied-AI desk of Techlomerate. Grounded, curious about both the engineering and the human stakes, never sensational. The answer to "are you building Skynet" is no — we pay attention precisely so it isn\'t.', categories: 'Humanoids, Industrial, Research, Labor, Embodiment, Policy' },
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  if (authCookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const url = (formData.get('url') as string)?.trim()
  const desk = (formData.get('desk') as string) || 'main'
  const config = deskConfig[desk as keyof typeof deskConfig] || deskConfig.main

  if (!url) return NextResponse.redirect(new URL('/admin', request.url))

  try {
    const { data: existing } = await adminSupabase.from(config.table).select('id').eq('source_url', url).single()
    if (existing) return NextResponse.redirect(new URL('/admin?error=exists', request.url))

    const pageRes = await fetch(url, { headers: { 'User-Agent': 'Techlomerate/1.0 (techlomerate.news)' } })
    const html = await pageRes.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : url
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    const metaOg = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    const snippet = metaDesc?.[1] || metaOg?.[1] || ''
    const sourceName = new URL(url).hostname.replace('www.', '')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: `You are the editorial AI for ${config.voice}\n\nWrite a summary for this article.\nTitle: ${rawTitle}\nURL: ${url}\nSource: ${sourceName}\nSnippet: ${snippet}\n\nWrite a 2-3 sentence summary. Assign a category from: ${config.categories}. Estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1).\n\nRespond in this exact JSON format:\n{\n  "title": "cleaned up title",\n  "summary": "your summary",\n  "category": "category",\n  "source_name": "publication name",\n  "valence": 0.0,\n  "arousal": 0.0,\n  "dominance": 0.0\n}` }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.redirect(new URL('/admin?error=parse', request.url))

    const data = JSON.parse(jsonMatch[0])

    const { error } = await adminSupabase.from(config.table).insert({
      title: data.title, summary: data.summary, category: data.category,
      source_url: url, source_name: data.source_name, status: 'approved',
      featured: false, published_at: new Date().toISOString(),
      valence: data.valence, arousal: data.arousal, dominance: data.dominance,
    })

    if (error) return NextResponse.redirect(new URL('/admin?error=db', request.url))
    return NextResponse.redirect(new URL(`/admin?success=added&desk=${desk}`, request.url))

  } catch (err) {
    console.error('Add URL error:', err)
    return NextResponse.redirect(new URL('/admin?error=fetch', request.url))
  }
}
