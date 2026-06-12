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
  searchParams: Promise<{ auth?: string; success?: string; error?: string; desk?: string }>
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
          <input name="password" type="password" placeholder="Password" style={{
            padding: '10px 14px', border: '0.5px solid var(--border-teal)', borderRadius: '6px',
            background: 'var(--bg)', fontSize: '14px', color: 'var(--fg)', outline: 'none',
          }} />
          <button type="submit" style={{
            padding: '10px 14px', background: 'var(--teal-600)', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer',
          }}>Enter</button>
        </form>
      </main>
    )
  }

  const { data: pending } = await adminSupabase
    .from('articles').select('*').eq('status', 'pending').order('published_at', { ascending: false })

  const { data: applePending } = await adminSupabase
    .from('apple_articles').select('*').eq('status', 'pending').order('published_at', { ascending: false })

  const { data: marketPending } = await adminSupabase
    .from('market_articles').select('*').eq('status', 'pending').order('published_at', { ascending: false })

  const { data: roboticsPending } = await adminSupabase
    .from('robotics_articles').select('*').eq('status', 'pending').order('published_at', { ascending: false })

  const { data: approved } = await adminSupabase
    .from('articles').select('*').eq('status', 'approved').order('published_at', { ascending: false }).limit(6)

  const successDesk = resolvedParams.desk || 'main'
  const deskLabel = successDesk === 'apple' ? 'One Recursive Loop' : successDesk === 'market' ? 'The Old Market' : successDesk === 'robotics' ? 'Definitely Not Skynet' : 'Techlomerate'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '4px' }}>Editorial gate</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {pending?.length || 0} main · {applePending?.length || 0} apple · {marketPending?.length || 0} market · {roboticsPending?.length || 0} robotics pending
            </div>
          </div>
          <a href="/" style={{ fontSize: '12px', color: 'var(--teal-600)', textDecoration: 'none' }}>View site →</a>
        </div>

        <div style={{ marginBottom: '40px', border: '0.5px solid var(--border-teal)', borderRadius: '8px', padding: '20px', background: 'var(--bg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '12px' }}>ADD ARTICLE BY URL</div>
          {resolvedParams.success === 'added' && (
            <div style={{ fontSize: '12px', color: 'var(--teal-600)', marginBottom: '12px', padding: '8px 12px', background: 'var(--teal-50)', borderRadius: '6px' }}>
              Article added to {deskLabel}.
            </div>
          )}
          {resolvedParams.error && (
            <div style={{ fontSize: '12px', color: '#c0392b', marginBottom: '12px', padding: '8px 12px', background: '#fdf0ed', borderRadius: '6px' }}>
              {resolvedParams.error === 'exists' ? 'That URL is already in the database.' :
               resolvedParams.error === 'fetch' ? 'Could not fetch that URL.' :
               resolvedParams.error === 'parse' ? 'Could not parse the article.' : 'Something went wrong.'}
            </div>
          )}
          <form action="/api/admin/add-url" method="POST" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input name="url" type="url" placeholder="https://..." required style={{
              flex: 1, minWidth: '200px', padding: '10px 14px', border: '0.5px solid var(--border-teal)',
              borderRadius: '6px', background: 'var(--bg)', fontSize: '13px', color: 'var(--fg)', outline: 'none',
            }} />
            <select name="desk" style={{
              padding: '10px 14px', border: '0.5px solid var(--border-teal)', borderRadius: '6px',
              background: 'var(--bg)', fontSize: '13px', color: 'var(--fg)', outline: 'none', cursor: 'pointer',
            }}>
              <option value="main">Techlomerate</option>
              <option value="apple">One Recursive Loop</option>
              <option value="market">The Old Market</option>
              <option value="robotics">Definitely Not Skynet</option>
            </select>
            <button type="submit" style={{
              padding: '10px 20px', background: 'var(--teal-600)', color: '#fff',
              border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>Add + publish</button>
          </form>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Claude reads the article, writes the summary in the desk&apos;s voice, scores VAD, and publishes directly.
          </div>
        </div>

        {pending && pending.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>TECHLOMERATE — PENDING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map((article) => (
                <div key={article.id} style={{ border: '0.5px solid var(--border-teal)', borderRadius: '8px', padding: '18px 20px', background: 'var(--teal-50)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500 }}>{article.category}</span>
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none' }}>{article.source_name} ↗</a>
                        {article.valence !== null && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>V:{article.valence?.toFixed(1)} A:{article.arousal?.toFixed(1)} D:{article.dominance?.toFixed(1)}</span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(article.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{article.summary}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'var(--teal-600)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Approve</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="true" /><input type="hidden" name="table" value="articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'var(--teal-400)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Feature</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'transparent', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {applePending && applePending.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>
              <span style={{ color: '#F25430' }}>ONE</span> <span style={{ color: '#4A90E2' }}>RECURSIVE</span> <span style={{ color: '#9013FE' }}>LOOP</span> — PENDING
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applePending.map((article) => (
                <div key={article.id} style={{ border: '0.5px solid #4A90E2', borderRadius: '8px', padding: '18px 20px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#4A90E2', fontWeight: 500 }}>{article.category}</span>
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#4A90E2', textDecoration: 'none' }}>{article.source_name} ↗</a>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(article.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{article.summary}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="apple_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Approve</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="true" /><input type="hidden" name="table" value="apple_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: '#9013FE', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Feature</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="apple_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'transparent', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {marketPending && marketPending.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>THE OLD MARKET — PENDING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {marketPending.map((article) => (
                <div key={article.id} style={{ border: '0.5px solid var(--border-teal)', borderRadius: '8px', padding: '18px 20px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--teal-600)', fontWeight: 500 }}>{article.category}</span>
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none' }}>{article.source_name} ↗</a>
                        {article.ticker && <span style={{ fontSize: '11px', color: 'var(--teal-600)', background: 'var(--teal-50)', padding: '2px 6px', borderRadius: '3px' }}>{article.ticker}</span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(article.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{article.summary}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="market_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'var(--teal-600)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Approve</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="true" /><input type="hidden" name="table" value="market_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'var(--teal-400)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Feature</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="market_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'transparent', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {roboticsPending && roboticsPending.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', color: '#E8A33D', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>DEFINITELY NOT SKYNET — PENDING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roboticsPending.map((article) => (
                <div key={article.id} style={{ border: '0.5px solid #E8A33D', borderRadius: '8px', padding: '18px 20px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#C77B30', fontWeight: 500 }}>{article.category}</span>
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none' }}>{article.source_name} ↗</a>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(article.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{article.summary}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="robotics_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: '#C77B30', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Approve</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="featured" value="true" /><input type="hidden" name="table" value="robotics_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: '#E8A33D', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Feature</button>
                      </form>
                      <form action="/api/admin/update" method="POST">
                        <input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="featured" value="false" /><input type="hidden" name="table" value="robotics_articles" />
                        <button type="submit" style={{ padding: '7px 16px', background: 'transparent', color: 'var(--text-tertiary)', border: '0.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Reject</button>
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
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.06em', marginBottom: '16px' }}>RECENTLY APPROVED</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {approved.map((article) => (
                <div key={article.id} style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{article.category}</span>
                      <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--teal-400)', textDecoration: 'none' }}>{article.source_name} ↗</a>
                    </div>
                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-serif)' }}>{article.title}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--teal-600)' }}>✓ Live</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(!pending || pending.length === 0) && (!applePending || applePending.length === 0) && (!marketPending || marketPending.length === 0) && (!roboticsPending || roboticsPending.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
            All queues clear.
            <div style={{ marginTop: '12px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/api/pipeline?secret=${process.env.PIPELINE_SECRET}`} style={{ fontSize: '12px', color: 'var(--teal-600)', textDecoration: 'none' }}>Run main pipeline →</a>
              <a href={`/api/apple-pipeline?secret=${process.env.PIPELINE_SECRET}`} style={{ fontSize: '12px', color: '#4A90E2', textDecoration: 'none' }}>Run Apple pipeline →</a>
              <a href={`/api/market-pipeline?secret=${process.env.PIPELINE_SECRET}`} style={{ fontSize: '12px', color: 'var(--teal-600)', textDecoration: 'none' }}>Run market pipeline →</a>
              <a href={`/api/robotics-pipeline?secret=${process.env.PIPELINE_SECRET}`} style={{ fontSize: '12px', color: '#E8A33D', textDecoration: 'none' }}>Run robotics pipeline →</a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
