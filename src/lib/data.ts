
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// --- Local File System Data Functions ---

// The canonical path to the data directory.
const dataDir = path.join(process.cwd(), 'src/data');

/**
 * Reads a JSON file from the local data directory.
 * If the file doesn't exist, it returns a default value.
 * @param filePath - The name of the file (e.g., "engine.json").
 * @param defaultValue - The value to return if the file doesn't exist.
 */
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
    const fullPath = path.join(dataDir, filePath);
    try {
        await fs.access(fullPath); // Check if file exists
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        // Handle empty file case, which is valid
        if (fileContent.trim() === '') {
            return defaultValue;
        }
        return JSON.parse(fileContent) as T;
    } catch (error) {
        // If file doesn't exist or any other read error, return the default.
        console.warn(`Could not read file ${fullPath}, returning default value. Error: ${error}`);
        return defaultValue;
    }
}

/**
 * Writes data to a JSON file in the local data directory.
 * Vercel's git integration will automatically commit this change to the repository.
 * @param filePath - The name of the file (e.g., "engine.json").
 * @param data - The data to write to the file.
 */
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    const fullPath = path.join(dataDir, filePath);
    try {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        const content = JSON.stringify(data, null, 2) + '\n';
        await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
        console.error(`Fatal error: Failed to write to local file: ${fullPath}`, error);
        // This is a critical error, as it means the primary data store failed.
        throw new Error(`Could not save data to the server's file system.`);
    }
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJsonFile<Author>('author.json', defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    await writeJsonFile('author.json', authorData);
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategorySlugs = categories.map(c => c.name.toLowerCase().replace(/ /g, '-'));
  let allArticles: Article[] = [];

  for (const categorySlug of allCategorySlugs) {
    const categoryArticles = await readJsonFile<Article[]>(`${categorySlug}.json`, []);
    allArticles.push(...categoryArticles);
  }

  // Deduplicate articles based on ID
  const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.id, article])).values());

  const sortedArticles = uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (options.includeDrafts) {
    return sortedArticles;
  }

  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  const articles = await readJsonFile<Article[]>(`${categorySlug}.json`, []);
  
  const sortedArticles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
  const allArticles = await getArticles({ includeDrafts: true });
  const article = allArticles.find(article => article.slug === slug);
  
  if (!article) return undefined;
  
  if (!options.includeDrafts && article.status !== 'published') return undefined;
  
  return article;
}

export async function addArticle(article: Omit<Article, 'id' | 'publishedAt'>): Promise<Article> {
    const newArticle: Article = { 
        ...article, 
        id: uuidv4(),
        publishedAt: new Date().toISOString() 
    };
    
    const categorySlug = newArticle.category.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`, []);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}". Please use a unique title.`);
    }

    articles.unshift(newArticle);
    await writeJsonFile(`${categorySlug}.json`, articles);
    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug' | 'id'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) throw new Error(`Article with slug "${slug}" not found.`);

    const updatedArticle = { ...originalArticle, ...articleData };

    if (articleData.status === 'published' && originalArticle.status === 'draft') {
        updatedArticle.publishedAt = new Date().toISOString();
    }

    const hasCategoryChanged = articleData.category && articleData.category !== originalArticle.category;

    if (hasCategoryChanged) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldArticles = await readJsonFile<Article[]>(`${oldCategorySlug}.json`, []);
        const filteredOldArticles = oldArticles.filter(a => a.id !== originalArticle.id);
        await writeJsonFile(`${oldCategorySlug}.json`, filteredOldArticles);
    }

    const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
    const newArticles = await readJsonFile<Article[]>(`${newCategorySlug}.json`, []);
    
    // Find index to update or -1 if it's a new category
    const articleIndexInNewList = newArticles.findIndex(a => a.id === updatedArticle.id);

    if (articleIndexInNewList === -1) { // Article is moving to a new category
        newArticles.unshift(updatedArticle);
    } else { // Article is being updated in the same category
        newArticles[articleIndexInNewList] = updatedArticle;
    }
    
    newArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    await writeJsonFile(`${newCategorySlug}.json`, newArticles);
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        console.warn(`Article with slug "${slug}" not found for deletion.`);
        return;
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`, []);
    const updatedArticles = articles.filter(a => a.id !== article.id);

    if (articles.length === updatedArticles.length) {
        console.warn(`Article with slug "${slug}" not found in its category file '${categorySlug}.json'. No deletion performed.`);
        return;
    }
    
    await writeJsonFile(`${categorySlug}.json`, updatedArticles);
}
