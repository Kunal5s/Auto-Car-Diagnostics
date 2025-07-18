
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import fs from 'fs/promises';
import path from 'path';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
const branch = process.env.GITHUB_REPO_BRANCH || 'main';

// --- GitHub API Helpers ---

async function getFileSha(filePath: string): Promise<string | null> {
    if (!owner || !repo) return null;
    try {
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: branch,
        });
        if (Array.isArray(response.data) || !('sha' in response.data)) {
            return null;
        }
        return response.data.sha;
    } catch (error: any) {
        if (error.status === 404) {
            return null; // File doesn't exist, so no SHA
        }
        console.error(`Error getting file SHA from GitHub: ${filePath}`, error);
        throw new Error(`Could not get file SHA from repository: ${filePath}`);
    }
}


async function commitData(filePath: string, content: string, commitMessage: string): Promise<void> {
    if (!owner || !repo || !process.env.GITHUB_TOKEN) {
        throw new Error("GitHub repository details are not configured in environment variables.");
    }
    
    const sha = await getFileSha(filePath);
    
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        sha, // Pass the SHA for updates, will be null for new files
        branch,
    });
}

// --- Local JSON File Handlers ---

async function readJsonFromLocal<T>(filePath: string, defaultValue: T): Promise<T> {
    const fullPath = path.join(process.cwd(), filePath);
    try {
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return defaultValue; // File doesn't exist, return default
        }
        console.error(`Error reading or parsing JSON from ${filePath}`, error);
        return defaultValue; // Return default on any other error
    }
}

async function writeJsonToGithub<T>(filePath: string, data: T, commitMessage: string): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await commitData(filePath, content, commitMessage);
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const filePath = 'src/data/author.json';
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJsonFromLocal<Author>(filePath, defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = 'src/data/author.json';
    await writeJsonToGithub(filePath, authorData, 'docs(content): update author information');
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
    
    // Reads from local file system as the source of truth for current articles
    const articles = await readJsonFromLocal<Article[]>(filePath, []);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}".`);
    }

    articles.unshift(newArticle);

    await writeJsonToGithub(
        filePath,
        articles,
        `feat(content): add article '${newArticle.title}'`
    );

    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) {
        throw new Error(`Article with slug "${slug}" not found.`);
    }

    const updatedArticle = { ...originalArticle, ...articleData };
    if (articleData.status) { // Only update publishedAt if status changes
        updatedArticle.publishedAt = new Date().toISOString();
    }


    if (articleData.category && articleData.category !== originalArticle.category) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = `src/data/${oldCategorySlug}.json`;
        const oldArticles = await readJsonFromLocal<Article[]>(oldFilePath, []);
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await writeJsonToGithub(
            oldFilePath,
            filteredArticles,
            `refactor(content): move article '${slug}' from ${originalArticle.category}`
        );

        // Add to new category file
        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = `src/data/${newCategorySlug}.json`;
        const newArticles = await readJsonFromLocal<Article[]>(newFilePath, []);
        newArticles.unshift(updatedArticle);
        await writeJsonToGithub(
            newFilePath,
            newArticles,
            `refactor(content): move article '${slug}' to ${updatedArticle.category}`
        );
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

        await writeJsonToGithub(
            filePath,
            articles,
            `docs(content): update article '${slug}'`
        );
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

    await writeJsonToGithub(
        filePath,
        updatedArticles,
        `feat(content): delete article '${slug}'`
    );
}
