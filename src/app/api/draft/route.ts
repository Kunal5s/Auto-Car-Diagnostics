
import { getArticleBySlug } from '@/lib/data';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  // This secret should be stored in environment variables
  if (secret !== process.env.NEXT_PUBLIC_DRAFT_MODE_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!slug) {
    return new Response('Slug not found', { status: 404 });
  }

  const article = await getArticleBySlug(slug, { includeDrafts: true });

  if (!article) {
    return new Response('Article not found', { status: 404 });
  }

  draftMode().enable();
  
  redirect(`/article/${article.slug}`);
}
