
'use server';

import type { Article, Author } from "@/lib/types";
import fs from 'fs/promises';
import path from 'path';
import { categories } from '@/lib/config';
import { Octokit } from '@octokit/rest';

const dataPath = path.join(process.cwd(), 'src', 'data');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
const branch = process.env.GITHUB_REPO_BRANCH || 'main';


async function readJsonFile<T>(filePath: string): Promise<T> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            if (filePath.endsWith('author.json')) {
                return {} as T;
            }
            return [] as T;
        }
        throw error;
    }
}

async function getFileSha(filePath: string): Promise<string | undefined> {
  if (!owner || !repo) return undefined;
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });
    const data = response.data as { sha: string };
    return data.sha;
  } catch (error: any) {
    if (error.status === 404) {
      return undefined; // File doesn't exist
    }
    throw error;
  }
}

async function commitData(commitDetails: { filePath: string, content: string, commitMessage: string }) {
    const { filePath, content, commitMessage } = commitDetails;
    if (!owner || !repo || !process.env.GITHUB_TOKEN) {
        throw new Error("GitHub repository details are not configured in environment variables.");
    }

    const currentSha = await getFileSha(filePath);

    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        sha: currentSha,
        branch,
    });
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

  // When fetching by category for public view, always filter for published.
  const publishedArticles = articles.filter(a => a.status === 'published');
  
  return publishedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Article | undefined> {
  const allArticles = await getArticles({ includeDrafts: true }); // Always get all articles first
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
    const filePath = path.join(dataPath, `${categorySlug}.json`);
    const relativeFilePath = path.join('src', 'data', `${categorySlug}.json`);

    let articles = [];
    try {
        articles = await readJsonFile<Article[]>(filePath);
    } catch (e) {
        // if file doesn't exist, we start with an empty array.
    }
    
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

    const updatedArticle = { ...originalArticle, ...articleData, publishedAt: new Date().toISOString() };

    if (articleData.category && articleData.category !== originalArticle.category) {
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = path.join(dataPath, `${oldCategorySlug}.json`);
        const oldRelativeFilePath = path.join('src', 'data', `${oldCategorySlug}.json`);
        let oldArticles = [];
        try { oldArticles = await readJsonFile<Article[]>(oldFilePath) } catch(e) {}
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await commitData({
            filePath: oldRelativeFilePath,
            content: JSON.stringify(filteredArticles, null, 2),
            commitMessage: `refactor(content): move article '${slug}' from ${originalArticle.category}`,
        });

        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = path.join(dataPath, `${newCategorySlug}.json`);
        const newRelativeFilePath = path.join('src', 'data', `${newCategorySlug}.json`);
        let newArticles = [];
        try { newArticles = await readJsonFile<Article[]>(newFilePath) } catch(e) {}
        newArticles.unshift(updatedArticle);
        await commitData({
            filePath: newRelativeFilePath,
            content: JSON.stringify(newArticles, null, 2),
            commitMessage: `refactor(content): move article '${slug}' to ${updatedArticle.category}`,
        });
    } else {
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const filePath = path.join(dataPath, `${categorySlug}.json`);
        const relativeFilePath = path.join('src', 'data', `${categorySlug}.json`);
        let articles: Article[] = [];
        try { articles = await readJsonFile<Article[]>(filePath) } catch(e) {}
        const articleIndex = articles.findIndex(a => a.slug === slug);
        if (articleIndex === -1) { 
             articles.unshift(updatedArticle);
        } else {
            articles[articleIndex] = updatedArticle;
        }
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
