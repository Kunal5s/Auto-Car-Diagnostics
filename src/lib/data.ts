
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// --- GitHub API Configuration ---
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
        // Handle empty file case
        if (fileContent.trim() === '') {
            return defaultValue;
        }
        return JSON.parse(fileContent) as T;
    } catch (error) {
        // If file doesn't exist or other error, return default
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

async function getFileShaFromGithub(filePath: string): Promise<string | undefined> {
    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) return undefined;
    
    try {
        const response = await fetch(`${GITHUB_API_URL}/contents/${filePath}?ref=${GITHUB_BRANCH}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
            cache: 'no-store'
        });
        if (!response.ok) {
            if (response.status === 404) return undefined; // File doesn't exist
            throw new Error(`GitHub API error getting file SHA: ${response.statusText}`);
        }
        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error(`Failed to get file SHA from GitHub: ${filePath}`, error);
        return undefined;
    }
}

async function commitFileToGithub(filePath: string, content: string, commitMessage: string, sha?: string): Promise<void> {
    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
        console.warn("GitHub credentials not configured. Skipping commit to GitHub.");
        return; // Don't throw an error, just skip the GitHub part
    }

    const encodedContent = Buffer.from(content).toString('base64');
    
    const body = JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        branch: GITHUB_BRANCH,
        sha: sha,
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
        // Don't throw, just log the error. The local save is the primary source of truth for the app.
    }
}

// Unified Write Function (writes to local AND GitHub)
async function writeJson<T>(filePath: string, data: T, commitMessage: string): Promise<void> {
    // Write to local file system first for speed and reliability of the live app
    await writeJsonToLocal(filePath, data);

    // Then, attempt to write to GitHub for permanent backup
    const githubFilePath = `src/data/${path.basename(filePath)}`;
    const sha = await getFileShaFromGithub(githubFilePath);
    const content = JSON.stringify(data, null, 2) + '\n';
    await commitFileToGithub(githubFilePath, content, commitMessage, sha);
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const filePath = 'author.json';
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJsonFromLocal<Author>(filePath, defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = 'author.json';
    await writeJson(filePath, authorData, `docs: update author profile`);
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategorySlugs = categories.map(c => c.name.toLowerCase().replace(/ /g, '-'));
  let allArticles: Article[] = [];

  for (const categorySlug of allCategorySlugs) {
    const filePath = `${categorySlug}.json`;
    const categoryArticles = await readJsonFromLocal<Article[]>(filePath, []);
    allArticles.push(...categoryArticles);
  }

  // Deduplicate articles based on ID, in case an article was moved but the old file wasn't cleaned up
  const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.id, article])).values());

  const sortedArticles = uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (options.includeDrafts) {
    return sortedArticles;
  }

  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  const filePath = `${categorySlug}.json`;
  const articles = await readJsonFromLocal<Article[]>(filePath, []);
  
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

export async function addArticle(article: Omit<Article, 'publishedAt' | 'id'>): Promise<Article> {
    const newArticle: Article = { 
        ...article, 
        id: uuidv4(), // Assign a new unique ID
        publishedAt: new Date().toISOString() 
    };
    
    const categorySlug = newArticle.category.toLowerCase().replace(/ /g, '-');
    const filePath = `${categorySlug}.json`;
    const articles = await readJsonFromLocal<Article[]>(filePath, []);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}". Please use a unique title.`);
    }

    articles.unshift(newArticle);
    await writeJson(filePath, articles, `feat: add article '${newArticle.title}'`);
    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug' | 'id'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) throw new Error(`Article with slug "${slug}" not found.`);

    const updatedArticle = { ...originalArticle, ...articleData };

    // If status changes from draft to published, update the timestamp
    if (articleData.status === 'published' && originalArticle.status === 'draft') {
        updatedArticle.publishedAt = new Date().toISOString();
    }

    const hasCategoryChanged = articleData.category && articleData.category !== originalArticle.category;

    if (hasCategoryChanged) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = `${oldCategorySlug}.json`;
        const oldArticles = await readJsonFromLocal<Article[]>(oldFilePath, []);
        const filteredArticles = oldArticles.filter(a => a.id !== originalArticle.id);
        await writeJson(oldFilePath, filteredArticles, `refactor: move article '${slug}' from ${originalArticle.category}`);
    }

    // Add to new category file (or update in the same file)
    const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
    const newFilePath = `${newCategorySlug}.json`;
    const newArticles = await readJsonFromLocal<Article[]>(newFilePath, []);
    const articleIndex = newArticles.findIndex(a => a.id === updatedArticle.id);

    if (articleIndex === -1) {
        // This happens when the category has changed, or if it was missing before
        newArticles.unshift(updatedArticle);
    } else {
        // This happens when updating an article in the same category
        newArticles[articleIndex] = updatedArticle;
    }

    const commitMessage = hasCategoryChanged 
        ? `refactor: move article '${slug}' to ${updatedArticle.category}`
        : `docs: update article '${slug}'`;

    await writeJson(newFilePath, newArticles, commitMessage);
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        console.warn(`Article with slug "${slug}" not found for deletion.`);
        return;
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const filePath = `${categorySlug}.json`;
    const articles = await readJsonFromLocal<Article[]>(filePath, []);
    const updatedArticles = articles.filter(a => a.id !== article.id);

    if (articles.length === updatedArticles.length) {
        // This might happen if the article was found in the global list but not its own category file (e.g., after a failed move)
        console.warn(`Article with slug "${slug}" not found in its category file '${filePath}'. No deletion performed from this file.`);
        return;
    }

    await writeJson(filePath, updatedArticles, `feat: delete article '${article.title}'`);
}
