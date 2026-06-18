import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://techlomerate.news'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Homepage + desk landing pages (the desks that link out have no internal
  // article pages, so only their landing page goes in the sitemap).
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/the-old-market`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/one-recursive-loop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/definitely-not-skynet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/the-thirst`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Internal article hub pages that live on our domain: main desk + The Thirst.
  const [{ data: mainArticles }, { data: thirstArticles }] = await Promise.all([
    supabase.from('articles').select('title, published_at').eq('status', 'approved'),
    supabase.from('thirst_articles').select('title, published_at').eq('status', 'approved'),
  ])

  const mainEntries: MetadataRoute.Sitemap = (mainArticles || []).map(a => ({
    url: `${BASE}/articles/${slugify(a.title)}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const thirstEntries: MetadataRoute.Sitemap = (thirstArticles || []).map(a => ({
    url: `${BASE}/the-thirst/${slugify(a.title)}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...mainEntries, ...thirstEntries]
}
