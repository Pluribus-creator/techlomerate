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

  const { error } = await adminSupabase
    .from('articles')
    .update({ status, featured })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}
