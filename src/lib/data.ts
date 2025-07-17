
'use server';

import type { Article, Author } from "@/lib/types";
import fs from 'fs/promises';
import path from 'path';
import { categories } from '@/lib/config';

const dataPath = path.join(process.cwd(), 'src', 'data');

async function readJsonFile<T>(filePath: string): Promise<T> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // File not found, return empty array for articles or default object for author
            if (filePath.endsWith('author.json')) {
                return {} as T;
            }
            return [] as T;
        }
        throw error;
    }
}

async function commitData(commitDetails: { filePath: string, content: string, commitMessage: string }) {
    const { filePath, content, commitMessage } = commitDetails;
    const url = new URL('/api/commit', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').toString();
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filePath,
            content,
            commitMessage,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to commit data to GitHub.');
    }

    return await response.json();
}

// --- Author Data Functions ---
export async function getAuthor(): Promise<Author> {
    const filePath = path.join(dataPath, 'author.json');
    return await readJsonFile<Author>(filePath);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = path.join('src', 'data', 'author.json');
    const content = JSON.stringify(authorData, null, 2);
    await commitData({
        filePath,
        content,
        commitMessage: 'docs(content): update author information',
    });
    return authorData;
}


// --- Article Data Functions ---
export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategoryNames = categories.map(c => c.name);
  let allArticles: Article[] = [];
  
  for (const categoryName of allCategoryNames) {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const filePath = path.join(dataPath, `${categorySlug}.json`);
    try {
        const categoryArticles = await readJsonFile<Article[]>(filePath);
        allArticles.push(...categoryArticles);
    } catch (error) {
        // if a category file doesn't exist, just skip it.
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }
  }
  
  const sortedArticles = allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  if (options.includeDrafts) {
    return sortedArticles;
  }
  
  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  const filePath = path.join(dataPath, `${categorySlug}.json`);
  const articles = await readJsonFile<Article[]>(filePath);

  const publishedArticles = articles.filter(a => a.status === 'published');
  
  return publishedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
  const allArticles = await getArticles({ includeDrafts: true }); // Always get all articles first
  const article = allArticles.find(article => article.slug === slug);
  
  if (!article) return undefined;

  // If not including drafts, and article is a draft, return undefined
  if (!options.includeDrafts && article.status !== 'published') {
    return undefined;
  }
  
  return article;
}

export async function addArticle(article: Omit<Article, 'publishedAt'>): Promise<Article> {
    const newArticle: Article = {
        ...article,
        publishedAt: new Date().toISOString(),
    };

    const categorySlug = newArticle.category.toLowerCase().replace(/ /g, '-');
    const filePath = path.join(dataPath, `${categorySlug}.json`);
    const relativeFilePath = path.join('src', 'data', `${categorySlug}.json`);

    const articles = await readJsonFile<Article[]>(filePath);
    
    // This was the buggy check causing the issue. It has been removed.

    articles.unshift(newArticle);

    await commitData({
        filePath: relativeFilePath,
        content: JSON.stringify(articles, null, 2),
        commitMessage: `feat(content): add article '${newArticle.title}'`,
    });

    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) {
        throw new Error(`Article with slug "${slug}" not found.`);
    }

    // Always update the publishedAt date to reflect the last update time.
    const updatedArticle = { ...originalArticle, ...articleData, publishedAt: new Date().toISOString() };

    // Handle category change
    if (articleData.category && articleData.category !== originalArticle.category) {
        // Delete from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = path.join(dataPath, `${oldCategorySlug}.json`);
        const oldRelativeFilePath = path.join('src', 'data', `${oldCategorySlug}.json`);
        const oldArticles = await readJsonFile<Article[]>(oldFilePath);
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await commitData({
            filePath: oldRelativeFilePath,
            content: JSON.stringify(filteredArticles, null, 2),
            commitMessage: `refactor(content): move article '${slug}' from ${originalArticle.category}`,
        });

        // Add to new category file
        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = path.join(dataPath, `${newCategorySlug}.json`);
        const newRelativeFilePath = path.join('src', 'data', `${newCategorySlug}.json`);
        const newArticles = await readJsonFile<Article[]>(newFilePath);
        newArticles.unshift(updatedArticle);
        await commitData({
            filePath: newRelativeFilePath,
            content: JSON.stringify(newArticles, null, 2),
            commitMessage: `refactor(content): move article '${slug}' to ${updatedArticle.category}`,
        });
    } else {
        // Update in the same category file
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const filePath = path.join(dataPath, `${categorySlug}.json`);
        const relativeFilePath = path.join('src', 'data', `${categorySlug}.json`);
        const articles = await readJsonFile<Article[]>(filePath);
        const articleIndex = articles.findIndex(a => a.slug === slug);
        if (articleIndex === -1) throw new Error("Consistency error: article not found in its category file.");
        articles[articleIndex] = updatedArticle;
        await commitData({
            filePath: relativeFilePath,
            content: JSON.stringify(articles, null, 2),
            commitMessage: `docs(content): update article '${slug}'`,
        });
    }
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        throw new Error(`Article with slug "${slug}" not found for deletion.`);
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const filePath = path.join(dataPath, `${categorySlug}.json`);
    const relativeFilePath = path.join('src', 'data', `${categorySlug}.json`);
    const articles = await readJsonFile<Article[]>(filePath);
    const updatedArticles = articles.filter(a => a.slug !== slug);

    if (articles.length === updatedArticles.length) {
        throw new Error(`Article with slug "${slug}" not found in its category file.`);
    }

    await commitData({
        filePath: relativeFilePath,
        content: JSON.stringify(updatedArticles, null, 2),
        commitMessage: `feat(content): delete article '${slug}'`,
    });
}
