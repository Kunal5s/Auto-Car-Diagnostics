
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Octokit } from '@octokit/rest';

// The canonical path to the data directory.
const dataDir = path.join(process.cwd(), 'src/data');

/**
 * Backs up a specific data file to GitHub.
 * This function is now called after every article change.
 * @param fileName - The name of the JSON file to back up (e.g., "engine.json").
 */
async function backupToGitHub(fileName: string): Promise<void> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;
    const BRANCH = 'main';

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        console.warn('GitHub credentials for backup are not configured. Skipping immediate backup.');
        return;
    }

    try {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });
        const filePath = path.join(dataDir, fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const repoFilePath = `src/data/${fileName}`;

        let existingFileSha: string | undefined;
        try {
            const { data: existingFile } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: repoFilePath,
                ref: BRANCH,
            });
            if ('sha' in existingFile) {
                existingFileSha = existingFile.sha;
            }
        } catch (error: any) {
            if (error.status !== 404) throw error;
        }

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: repoFilePath,
            message: `feat(content): update ${fileName}`,
            content: Buffer.from(fileContent).toString('base64'),
            sha: existingFileSha,
            branch: BRANCH,
        });
        console.log(`Successfully backed up ${fileName} to GitHub.`);
    } catch (error) {
        console.error(`Immediate GitHub backup for ${fileName} failed:`, error);
        // We don't re-throw the error, as the primary operation (saving the file) succeeded.
        // The cron job will act as a fallback.
    }
}


/**
 * Ensures a file exists, creating it with default content if it doesn't.
 * This prevents read/write errors on non-existent files.
 * @param filePath - The relative path within the data directory.
 * @param defaultContent - The default content to write if the file is created.
 */
async function ensureFileExists(filePath: string, defaultContent: string = '[]\n'): Promise<void> {
    const fullPath = path.join(dataDir, filePath);
    try {
        await fs.access(fullPath);
    } catch (error) {
        // File does not exist, create it.
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, defaultContent, 'utf-8');
    }
}

/**
 * Reads a JSON file from the local data directory.
 * @param filePath - The name of the file (e.g., "engine.json").
 */
async function readJsonFile<T>(filePath: string): Promise<T> {
    await ensureFileExists(filePath); // Ensure the file exists before reading
    const fullPath = path.join(dataDir, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    // Handle empty file case, which is valid JSON for an empty array
    if (fileContent.trim() === '') {
        return [] as T;
    }
    return JSON.parse(fileContent) as T;
}

/**
 * Writes data to a JSON file in the local data directory.
 * @param filePath - The name of the file (e.g., "engine.json").
 * @param data - The data to write to the file.
 */
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    await ensureFileExists(filePath); // Ensure the directory exists before writing
    const fullPath = path.join(dataDir, filePath);
    const content = JSON.stringify(data, null, 2) + '\n';
    await fs.writeFile(fullPath, content, 'utf-8');
}


// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    try {
        await ensureFileExists('author.json', JSON.stringify(defaultAuthor, null, 2) + '\n');
        const author = await readJsonFile<Author>('author.json');
        return author;
    } catch (error) {
        return defaultAuthor;
    }
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    await writeJsonFile('author.json', authorData);
    await backupToGitHub('author.json'); // Backup author info on change
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategorySlugs = categories.map(c => c.name.toLowerCase().replace(/ /g, '-'));
  let allArticles: Article[] = [];

  for (const categorySlug of allCategorySlugs) {
    try {
        await ensureFileExists(`${categorySlug}.json`);
        const categoryArticles = await readJsonFile<Article[]>(`${categorySlug}.json`);
        allArticles.push(...categoryArticles);
    } catch(e) {
        console.warn(`Could not read articles for category: ${categorySlug}.json`);
        // file probably doesn't exist, which is fine
    }
  }

  // Deduplicate articles based on ID, important if an article was somehow in multiple files
  const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.id, article])).values());

  const sortedArticles = uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (options.includeDrafts) {
    return sortedArticles;
  }

  return sortedArticles.filter(a => a.status === 'published');
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  await ensureFileExists(`${categorySlug}.json`);
  const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
  
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
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
    
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}". Please use a unique title.`);
    }

    articles.unshift(newArticle); // Add to the beginning of the list
    await writeJsonFile(`${categorySlug}.json`, articles);
    await backupToGitHub(`${categorySlug}.json`); // Immediate backup on add
    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug' | 'id'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) throw new Error(`Article with slug "${slug}" not found.`);

    const updatedArticle = { ...originalArticle, ...articleData };

    // If changing status from draft to published, update the published date
    if (articleData.status === 'published' && originalArticle.status === 'draft') {
        updatedArticle.publishedAt = new Date().toISOString();
    }

    const hasCategoryChanged = articleData.category && articleData.category !== originalArticle.category;

    if (hasCategoryChanged) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldArticles = await readJsonFile<Article[]>(`${oldCategorySlug}.json`);
        const filteredOldArticles = oldArticles.filter(a => a.id !== originalArticle.id);
        await writeJsonFile(`${oldCategorySlug}.json`, filteredOldArticles);
        await backupToGitHub(`${oldCategorySlug}.json`); // Backup old category file
    }

    const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
    const newArticles = await readJsonFile<Article[]>(`${newCategorySlug}.json`);
    
    const articleIndexInNewList = newArticles.findIndex(a => a.id === updatedArticle.id);

    if (articleIndexInNewList === -1) { // Article is moving to a new category
        newArticles.unshift(updatedArticle); // Add to the top
    } else { // Article is being updated in the same category
        newArticles[articleIndexInNewList] = updatedArticle;
    }
    
    // Sort by date to maintain order
    newArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    await writeJsonFile(`${newCategorySlug}.json`, newArticles);
    await backupToGitHub(`${newCategorySlug}.json`); // Backup new/current category file
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        // It might have been deleted already, so don't throw an error.
        console.warn(`Article with slug "${slug}" not found for deletion, it might have been deleted already.`);
        return;
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const articles = await readJsonFile<Article[]>(`${categorySlug}.json`);
    const updatedArticles = articles.filter(a => a.id !== article.id);
    
    await writeJsonFile(`${categorySlug}.json`, updatedArticles);
    await backupToGitHub(`${categorySlug}.json`); // Backup on delete
}
