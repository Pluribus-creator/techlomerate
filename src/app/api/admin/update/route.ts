import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const featured = formData.get('featured') === 'true'
  const table = (formData.get('table') as string) || 'articles'

  const validTables = ['articles', 'apple_articles', 'market_articles', 'robotics_articles', 'thirst_articles']
  const targetTable = validTables.includes(table) ? table : 'articles'

  if (featured) {
    await adminSupabase
      .from(targetTable)
      .update({ featured: false })
      .eq('featured', true)
  }

  const { error } = await adminSupabase
    .from(targetTable)
    .update({ status, featured })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}
