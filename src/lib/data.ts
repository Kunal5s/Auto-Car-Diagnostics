
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

// --- Local JSON File Handlers ---

async function readJsonFromLocal<T>(filePath: string, defaultValue: T): Promise<T> {
    const fullPath = path.join(process.cwd(), filePath);
    try {
        await fs.access(fullPath); // Check if file exists
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error: any) {
        // If file doesn't exist or another error occurs, return the default.
        // This is safe for read operations.
        return defaultValue;
    }
}

async function writeJsonToLocal<T>(filePath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2) + '\n';
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
        // Ensure directory exists before writing
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
        console.error(`Failed to write to local file: ${fullPath}`, error);
        throw new Error(`Could not save data to the server.`);
    }
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const filePath = 'src/data/author.json';
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJsonFromLocal<Author>(filePath, defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = 'src/data/author.json';
    await writeJsonToLocal(filePath, authorData);
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategoryNames = categories.map(c => c.name);
  let allArticles: Article[] = [];

  for (const categoryName of allCategoryNames) {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const categoryArticles = await readJsonFromLocal<Article[]>(filePath, []);
    allArticles.push(...categoryArticles);
  }

  const sortedArticles = allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (options.includeDrafts) {
    return sortedArticles;
  }

  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  const filePath = `src/data/${categorySlug}.json`;
  const articles = await readJsonFromLocal<Article[]>(filePath, []);

  // When fetching by category for public view, always filter for published.
  const publishedArticles = articles.filter(a => a.status === 'published');

  return publishedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
  const allArticles = await getArticles({ includeDrafts: true });
  const article = allArticles.find(article => article.slug === slug);

  if (!article) return undefined;

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
    const filePath = `src/data/${categorySlug}.json`;
    
    const articles = await readJsonFromLocal<Article[]>(filePath, []);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}".`);
    }

    articles.unshift(newArticle);

    await writeJsonToLocal(filePath, articles);

    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) {
        throw new Error(`Article with slug "${slug}" not found.`);
    }

    const updatedArticle = { ...originalArticle, ...articleData };
    if (articleData.status && articleData.status !== originalArticle.status) { // Only update publishedAt if status changes
        updatedArticle.publishedAt = new Date().toISOString();
    }


    if (articleData.category && articleData.category !== originalArticle.category) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = `src/data/${oldCategorySlug}.json`;
        const oldArticles = await readJsonFromLocal<Article[]>(oldFilePath, []);
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await writeJsonToLocal(oldFilePath, filteredArticles);

        // Add to new category file
        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = `src/data/${newCategorySlug}.json`;
        const newArticles = await readJsonFromLocal<Article[]>(newFilePath, []);
        newArticles.unshift(updatedArticle);
        await writeJsonToLocal(newFilePath, newArticles);
    } else {
        // Update in the same category file
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const filePath = `src/data/${categorySlug}.json`;
        const articles = await readJsonFromLocal<Article[]>(filePath, []);
        const articleIndex = articles.findIndex(a => a.slug === slug);

        if (articleIndex === -1) {
             articles.unshift(updatedArticle);
        } else {
            articles[articleIndex] = updatedArticle;
        }

        await writeJsonToLocal(filePath, articles);
    }
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        console.warn(`Article with slug "${slug}" not found for deletion.`);
        return;
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const articles = await readJsonFromLocal<Article[]>(filePath, []);
    const updatedArticles = articles.filter(a => a.slug !== slug);

    if (articles.length === updatedArticles.length) {
        console.warn(`Article with slug "${slug}" not found in its category file for deletion, though it was found globally.`);
        return;
    }

    await writeJsonToLocal(filePath, updatedArticles);
}
