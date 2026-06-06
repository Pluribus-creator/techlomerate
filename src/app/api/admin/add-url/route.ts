import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')

  if (authCookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const url = (formData.get('url') as string)?.trim()

  if (!url) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  try {
    const { data: existing } = await adminSupabase
      .from('articles')
      .select('id')
      .eq('source_url', url)
      .single()

    if (existing) {
      return NextResponse.redirect(new URL('/admin?error=exists', request.url))
    }

    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Techlomerate/1.0 (techlomerate.news)' },
    })
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
      messages: [{
        role: 'user',
        content: `You are the editorial AI for Techlomerate, a thoughtful AI news publication. Write a summary and assign metadata for this article.

Title: ${rawTitle}
URL: ${url}
Source: ${sourceName}
Snippet: ${snippet}

Write a 2-3 sentence summary in Techlomerate's voice: clear, honest, no hype.
Assign a category from: Research, Policy, Safety, Industry, Ethics, Science, AI
Estimate VAD scores (valence -1 to 1, arousal 0 to 1, dominance 0 to 1)

Respond in this exact JSON format:
{
  "title": "cleaned up title (remove site name suffix if present)",
  "summary": "your 2-3 sentence summary",
  "category": "category",
  "source_name": "clean publication name",
  "valence": 0.0,
  "arousal": 0.0,
  "dominance": 0.0
}`
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.redirect(new URL('/admin?error=parse', request.url))
    }

    const data = JSON.parse(jsonMatch[0])

    const { error } = await adminSupabase
      .from('articles')
      .insert({
        title: data.title,
        summary: data.summary,
        category: data.category,
        source_url: url,
        source_name: data.source_name,
        status: 'approved',
        featured: false,
        published_at: new Date().toISOString(),
        valence: data.valence,
        arousal: data.arousal,
        dominance: data.dominance,
      })

    if (error) {
      return NextResponse.redirect(new URL('/admin?error=db', request.url))
    }

    return NextResponse.redirect(new URL('/admin?success=added', request.url))

  } catch (err) {
    console.error('Add URL error:', err)
    return NextResponse.redirect(new URL('/admin?error=fetch', request.url))
  }
}
