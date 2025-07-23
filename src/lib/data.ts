
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'src/data');

async function ensureFileExists(filePath: string, defaultContent: string = '[]\n'): Promise<void> {
    const fullPath = path.join(dataDir, filePath);
    try {
        await fs.access(fullPath);
    } catch (error) {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, defaultContent, 'utf-8');
    }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
    await ensureFileExists(filePath);
    const fullPath = path.join(dataDir, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    if (fileContent.trim() === '') {
        return [] as T;
    }
    return JSON.parse(fileContent) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<string> {
    await ensureFileExists(filePath);
    const fullPath = path.join(dataDir, filePath);
    const content = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(fullPath, content, 'utf-8');
    return content;
}

export async function getAuthor(): Promise<Author> {
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    try {
        await ensureFileExists('author.json', JSON.stringify(defaultAuthor, null, 2) + '\n');
        return await readJsonFile<Author>('author.json');
    } catch (error) {
        return defaultAuthor;
    }
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    await writeJsonFile('author.json', authorData);
    // GitHub commit functionality is removed to avoid dependency on @octokit/rest and env vars
    return authorData;
}

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
    const allCategorySlugs = categories.map(c => c.name.toLowerCase().replace(/ /g, '-'));
    let allArticles: Article[] = [];

    for (const categorySlug of allCategorySlugs) {
        try {
            // Check if file exists before trying to read it
            const filePath = path.join(dataDir, `${categorySlug}.json`);
            await fs.access(filePath);
            const categoryArticles = await readJsonFile<Article[]>(`${categorySlug}.json`);
            allArticles.push(...categoryArticles);
        } catch (e) {
            // If file doesn't exist, it's not an error, just means no articles for this category yet.
            console.warn(`No data file found for category: ${categorySlug}.json. Skipping.`);
        }
    }

    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.id, article])).values());
    const sortedArticles = uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return options.includeDrafts ? sortedArticles : sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
    const sortedArticles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
    const allArticles = await getArticles({ includeDrafts: true });
    const article = allArticles.find(article => article.slug === slug);
    if (!article || (!options.includeDrafts && article.status !== 'published')) {
        return undefined;
    }
    return article;
}

export async function addArticle(article: Omit<Article, 'id' | 'publishedAt'>): Promise<Article> {
    const existingArticle = await getArticleBySlug(article.slug, { includeDrafts: true });
    if (existingArticle) {
        // If an article with the same slug exists, update it instead of creating a new one.
        // This prevents duplicates if the user navigates away and comes back.
        return updateArticle(existingArticle.slug, article);
    }
    
    const newArticle: Article = { 
        ...article, 
        id: uuidv4(),
        publishedAt: new Date().toISOString() 
    };

    const categorySlug = newArticle.category.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
    
    articles.unshift(newArticle);
    await writeJsonFile(`${categorySlug}.json`, articles);

    // GitHub commit functionality is removed
    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'id'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) throw new Error(`Article with slug "${slug}" not found.`);

    const updatedArticle = { ...originalArticle, ...articleData };
    const hasCategoryChanged = articleData.category && articleData.category !== originalArticle.category;
    
    if (articleData.status === 'published' && originalArticle.status === 'draft') {
        updatedArticle.publishedAt = new Date().toISOString();
    }

    if (hasCategoryChanged) {
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldArticles = await readJsonFile<Article[]>(`${oldCategorySlug}.json`);
        const filteredOldArticles = oldArticles.filter(a => a.id !== originalArticle.id);
        await writeJsonFile(`${oldCategorySlug}.json`, filteredOldArticles);

        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newArticles = await readJsonFile<Article[]>(`${newCategorySlug}.json`);
        newArticles.unshift(updatedArticle);
        newArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        await writeJsonFile(`${newCategorySlug}.json`, newArticles);
    } else {
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
        const articleIndex = articles.findIndex(a => a.id === updatedArticle.id);
        
        if (articleIndex !== -1) {
            articles[articleIndex] = updatedArticle;
        } else {
            articles.unshift(updatedArticle);
        }
        
        articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        await writeJsonFile(`${categorySlug}.json`, articles);
    }
    
    // GitHub commit functionality is removed
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        console.warn(`Article with slug "${slug}" not found for deletion, it might have been deleted already.`);
        return;
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
    const updatedArticles = articles.filter(a => a.id !== article.id);
    
    await writeJsonFile(`${categorySlug}.json`, updatedArticles);
    
    // GitHub commit functionality is removed
}
