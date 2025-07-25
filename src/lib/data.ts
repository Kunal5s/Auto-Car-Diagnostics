
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

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

export async function getAuthor(): Promise<Author> {
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    try {
        await ensureFileExists('author.json', JSON.stringify(defaultAuthor, null, 2) + '\n');
        return await readJsonFile<Author>('author.json');
    } catch (error) {
        return defaultAuthor;
    }
}

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
    const allCategorySlugs = categories.map(c => c.name.toLowerCase().replace(/ /g, '-'));
    let allArticles: Article[] = [];

    for (const categorySlug of allCategorySlugs) {
        try {
            const filePath = path.join(dataDir, `${categorySlug}.json`);
            await fs.access(filePath);
            const categoryArticles = await readJsonFile<Article[]>(`${categorySlug}.json`);
            allArticles.push(...categoryArticles);
        } catch (e) {
            // It's okay if a category file doesn't exist
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
