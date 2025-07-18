
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

// --- GitHub API Configuration ---
// Corrected to match the environment variables provided by the user.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO_NAME;
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

// --- Local File Handlers ---

async function readJsonFromLocal<T>(filePath: string, defaultValue: T): Promise<T> {
    const fullPath = path.join(process.cwd(), 'src/data', path.basename(filePath));
    try {
        await fs.access(fullPath);
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error) {
        return defaultValue;
    }
}

async function writeJsonToLocal<T>(filePath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2) + '\n';
    const fullPath = path.join(process.cwd(), 'src/data', path.basename(filePath));
    try {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
        console.error(`Failed to write to local file: ${fullPath}`, error);
        throw new Error(`Could not save data to the server's local storage.`);
    }
}

// --- GitHub Data Functions ---

async function getFileFromGithub(filePath: string): Promise<{ content?: string; sha?: string }> {
    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) return {};
    
    try {
        const response = await fetch(`${GITHUB_API_URL}/contents/${filePath}?ref=${GITHUB_BRANCH}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
            cache: 'no-store'
        });
        if (!response.ok) {
            if (response.status === 404) return {}; // File doesn't exist, which is a valid case
            throw new Error(`GitHub API error getting file: ${response.statusText}`);
        }
        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content, sha: data.sha };
    } catch (error) {
        console.error(`Failed to get file from GitHub: ${filePath}`, error);
        return {}; // Return empty on error to avoid breaking read operations
    }
}


async function commitFileToGithub(filePath: string, content: string, commitMessage: string, sha?: string): Promise<void> {
    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
        // This check ensures we don't proceed if credentials are not found.
        throw new Error("GitHub repository details are not configured in environment variables.");
    }

    const encodedContent = Buffer.from(content).toString('base64');
    
    const body = JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        branch: GITHUB_BRANCH,
        sha: sha, // Include SHA if updating an existing file
    });

    const response = await fetch(`${GITHUB_API_URL}/contents/${filePath}`, {
        method: 'PUT',
        headers: { 
            Authorization: `Bearer ${GITHUB_TOKEN}`, 
            Accept: 'application/vnd.github.v3+json', 
            'Content-Type': 'application/json' 
        },
        body: body,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("GitHub API commit failed:", errorData);
        throw new Error(`Failed to commit file to GitHub: ${errorData.message}`);
    }
}

// Unified Read Function
async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
    return await readJsonFromLocal<T>(filePath, defaultValue);
}

// Unified Write Function (writes to local AND GitHub)
async function writeJson<T>(filePath: string, data: T, commitMessage: string): Promise<void> {
    // Write to local file system first for speed and reliability of the live app
    await writeJsonToLocal(filePath, data);

    // Then, write to GitHub for permanent backup
    try {
        const githubFilePath = `src/data/${path.basename(filePath)}`;
        const { sha } = await getFileFromGithub(githubFilePath); // Get latest SHA before committing
        const content = JSON.stringify(data, null, 2) + '\n';
        await commitFileToGithub(githubFilePath, content, commitMessage, sha);
    } catch (error) {
        // Log the error but don't block the user operation.
        // The primary action (saving to local) has already succeeded.
        console.error("Failed to commit backup to GitHub, but local save succeeded:", error);
    }
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const filePath = 'src/data/author.json';
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJson<Author>(filePath, defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = 'src/data/author.json';
    await writeJson(filePath, authorData, `docs: update author profile`);
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategoryNames = categories.map(c => c.name);
  let allArticles: Article[] = [];

  for (const categoryName of allCategoryNames) {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const categoryArticles = await readJson<Article[]>(filePath, []);
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
  const articles = await readJson<Article[]>(filePath, []);
  
  // Always sort before filtering
  const sortedArticles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const publishedArticles = sortedArticles.filter(a => a.status === 'published');
  
  return publishedArticles;
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
  const allArticles = await getArticles({ includeDrafts: true });
  const article = allArticles.find(article => article.slug === slug);
  if (!article) return undefined;
  if (!options.includeDrafts && article.status !== 'published') return undefined;
  return article;
}

export async function addArticle(article: Omit<Article, 'publishedAt'>): Promise<Article> {
    const newArticle: Article = { ...article, publishedAt: new Date().toISOString() };
    const categorySlug = newArticle.category.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const articles = await readJson<Article[]>(filePath, []);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}".`);
    }

    articles.unshift(newArticle);
    await writeJson(filePath, articles, `feat: add article '${newArticle.title}'`);
    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) throw new Error(`Article with slug "${slug}" not found.`);

    const updatedArticle = { ...originalArticle, ...articleData };
    if (articleData.status && articleData.status !== originalArticle.status) {
        updatedArticle.publishedAt = new Date().toISOString();
    }

    if (articleData.category && articleData.category !== originalArticle.category) {
        // Move article: Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = `src/data/${oldCategorySlug}.json`;
        const oldArticles = await readJson<Article[]>(oldFilePath, []);
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await writeJson(oldFilePath, filteredArticles, `refactor: move article '${slug}' from ${originalArticle.category}`);

        // Add to new category file
        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = `src/data/${newCategorySlug}.json`;
        const newArticles = await readJson<Article[]>(newFilePath, []);
        newArticles.unshift(updatedArticle);
        await writeJson(newFilePath, newArticles, `refactor: move article '${slug}' to ${updatedArticle.category}`);
    } else {
        // Update article in the same category
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const filePath = `src/data/${categorySlug}.json`;
        const articles = await readJson<Article[]>(filePath, []);
        const articleIndex = articles.findIndex(a => a.slug === slug);

        if (articleIndex === -1) {
            articles.unshift(updatedArticle);
        } else {
            articles[articleIndex] = updatedArticle;
        }

        await writeJson(filePath, articles, `docs: update article '${slug}'`);
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
    const articles = await readJson<Article[]>(filePath, []);
    const updatedArticles = articles.filter(a => a.slug !== slug);

    if (articles.length === updatedArticles.length) {
        console.warn(`Article with slug "${slug}" not found in its category file.`);
        return;
    }

    await writeJson(filePath, updatedArticles, `feat: delete article '${slug}'`);
}
