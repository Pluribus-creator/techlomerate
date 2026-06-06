import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>
}) {
  const resolvedParams = await searchParams
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  const isAuthed = authCookie?.value === process.env.ADMIN_PASSWORD

  if (!isAuthed) {
    if (resolvedParams.auth === process.env.ADMIN_PASSWORD) {
      redirect(`/api/admin/auth?password=${resolvedParams.auth}`)
    }
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form action="/api/admin/auth" method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>Techlomerate</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Editorial gate</div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            style={{
              padding: '10px 14px',
              border: '0.5px solid var(--border-teal)',
              borderRadius: '6px',
              background: 'var(--bg)',
              fontSize: '14px',
              color: 'var(--fg)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 14px',
              background: 'var(--teal-600)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Enter
          </button>
        </form>
      </main>
    )
  }

  const { data: pending } = await adminSupabase
    .from('articles')
    .select('*')
    .eq('status', 'pending')
    .order('published_at', { ascending: false })

  const { data: approved } = await adminSupabase
    .from('articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })
    .limit(10)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '4px' }}>Editorial gate</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {pending?.length || 0} pending · {approved?.length || 0} recently approved
            </div>
          </div>
          <a href="/" style={{ fontSize: '12px', color: 'var(--teal-600)', textDecoration: 'none' }}>
            View site →
          </a>
        </div>

        {pending && pending.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>
              PENDING REVIEW
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map((article) => (
                <div key={article.id} style={{
                  border: '0.5px solid var(--border-teal)',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  background: 'var(--teal-50)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500 }}>
                          {article.category}
                        </span>
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none', letterSpacing: '0.02em' }}
                        >
                          {article.source_name} ↗
                        </a>
                        {article.valence !== null && (
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                            V:{article.valence?.toFixed(1)} A:{article.arousal?.toFixed(1)} D:{article.dominance?.toFixed(1)}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {new Date(article.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>
                        {article.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {article.summary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} />
                        <input type="hidden" name="status" value="approved" />
                        <input type="hidden" name="featured" value="false" />
                        <button type="submit" style={{
                          padding: '7px 16px', background: 'var(--teal-600)', color: '#fff',
                          border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%',
                        }}>Approve</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} />
                        <input type="hidden" name="status" value="approved" />
                        <input type="hidden" name="featured" value="true" />
                        <button type="submit" style={{
                          padding: '7px 16px', background: 'var(--teal-400)', color: '#fff',
                          border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%',
                        }}>Feature</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <input type="hidden" name="featured" value="false" />
                        <button type="submit" style={{
                          padding: '7px 16px', background: 'transparent', color: 'var(--text-tertiary)',
                          border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%',
                        }}>Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {approved && approved.length > 0 && (
          <section>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>
              RECENTLY APPROVED
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {approved.map((article) => (
                <div key={article.id} style={{
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{article.category}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>·</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{article.featured ? 'Featured' : 'Standard'}</span>
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none' }}
                      >
                        {article.source_name} ↗
                      </a>
                    </div>
                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-serif)' }}>{article.title}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--teal-600)' }}>✓ Live</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(!pending || pending.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Queue is clear. Run the pipeline to fetch new articles.
            <div style={{ marginTop: '16px' }}>
              <a
                href={`/api/pipeline?secret=${process.env.PIPELINE_SECRET}`}
                style={{ fontSize: '12px', color: 'var(--teal-600)', textDecoration: 'none' }}
              >
                Run pipeline →
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
