import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://techlomerate.news',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}