import { getArticles } from '@/lib/data'
import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map(article => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/article/${article.slug}`,
    lastModified: new Date(article.publishedAt),
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us`,
      lastModified: new Date(),
    },
    {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact-us`,
        lastModified: new Date(),
    },
    ...articleEntries,
  ]
}