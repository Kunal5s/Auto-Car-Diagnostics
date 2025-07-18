
'use server';

import type { Article, Author } from "@/lib/types";
import { categories } from '@/lib/config';
import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
const branch = process.env.GITHUB_REPO_BRANCH || 'main';

// --- GitHub API Helpers ---

async function getFileFromGithub(filePath: string): Promise<{ content: string; sha: string } | null> {
    if (!owner || !repo) return null;
    try {
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: branch,
        });
        // This check is crucial to ensure we're dealing with a file and not a directory.
        if (Array.isArray(response.data) || !('content' in response.data)) {
            return null;
        }
        const data = response.data as { content: string; encoding: "base64", sha: string };
        const decodedContent = Buffer.from(data.content, data.encoding).toString('utf-8');
        return { content: decodedContent, sha: data.sha };
    } catch (error: any) {
        if (error.status === 404) {
            return null; // File doesn't exist
        }
        console.error(`Error fetching file from GitHub: ${filePath}`, error);
        throw new Error(`Could not fetch file from repository: ${filePath}`);
    }
}

async function commitData(filePath: string, content: string, commitMessage: string): Promise<void> {
    if (!owner || !repo || !process.env.GITHUB_TOKEN) {
        throw new Error("GitHub repository details are not configured in environment variables.");
    }
    
    const file = await getFileFromGithub(filePath);
    
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        sha: file?.sha, // undefined if file is new
        branch,
    });
}

// --- Generic JSON Handlers ---

async function readJsonFromGithub<T>(filePath: string, defaultValue: T): Promise<T> {
    const file = await getFileFromGithub(filePath);
    if (!file) {
        // If the file doesn't exist, let's create it with the default value to ensure stability.
        if(filePath.startsWith('src/data/') && filePath.endsWith('.json')) {
            await commitData(filePath, JSON.stringify(defaultValue, null, 2), `feat(content): create initial data file for ${filePath.split('/').pop()}`);
        }
        return defaultValue;
    }
    try {
        return JSON.parse(file.content) as T;
    } catch (error) {
        console.error(`Error parsing JSON from ${filePath}`, error);
        return defaultValue;
    }
}

// --- Author Data Functions ---

export async function getAuthor(): Promise<Author> {
    const filePath = 'src/data/author.json';
    const defaultAuthor: Author = { name: 'Author', role: 'Writer', bio: '', imageUrl: '' };
    return await readJsonFromGithub<Author>(filePath, defaultAuthor);
}

export async function updateAuthor(authorData: Author): Promise<Author> {
    const filePath = 'src/data/author.json';
    const content = JSON.stringify(authorData, null, 2);
    await commitData(filePath, content, 'docs(content): update author information');
    return authorData;
}


// --- Article Data Functions ---

export async function getArticles(options: { includeDrafts?: boolean } = {}): Promise<Article[]> {
  const allCategoryNames = categories.map(c => c.name);
  let allArticles: Article[] = [];

  for (const categoryName of allCategoryNames) {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const categoryArticles = await readJsonFromGithub<Article[]>(filePath, []);
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
  const articles = await readJsonFromGithub<Article[]>(filePath, []);

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
    
    const articles = await readJsonFromGithub<Article[]>(filePath, []);
    
    // Check if article with same slug already exists to prevent duplicates
    const existingIndex = articles.findIndex(a => a.slug === newArticle.slug);
    if (existingIndex !== -1) {
        throw new Error(`Article with slug "${newArticle.slug}" already exists in category "${newArticle.category}".`);
    }

    articles.unshift(newArticle);

    await commitData(
        filePath,
        JSON.stringify(articles, null, 2),
        `feat(content): add article '${newArticle.title}'`
    );

    return newArticle;
}

export async function updateArticle(slug: string, articleData: Partial<Omit<Article, 'slug'>>): Promise<Article> {
    const originalArticle = await getArticleBySlug(slug, { includeDrafts: true });
    if (!originalArticle) {
        throw new Error(`Article with slug "${slug}" not found.`);
    }

    const updatedArticle = { ...originalArticle, ...articleData, publishedAt: new Date().toISOString() };

    // If category has changed, we need to remove from old file and add to new file
    if (articleData.category && articleData.category !== originalArticle.category) {
        // Remove from old category file
        const oldCategorySlug = originalArticle.category.toLowerCase().replace(/ /g, '-');
        const oldFilePath = `src/data/${oldCategorySlug}.json`;
        const oldArticles = await readJsonFromGithub<Article[]>(oldFilePath, []);
        const filteredArticles = oldArticles.filter(a => a.slug !== slug);
        await commitData(
            oldFilePath,
            JSON.stringify(filteredArticles, null, 2),
            `refactor(content): move article '${slug}' from ${originalArticle.category}`
        );

        // Add to new category file
        const newCategorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const newFilePath = `src/data/${newCategorySlug}.json`;
        const newArticles = await readJsonFromGithub<Article[]>(newFilePath, []);
        newArticles.unshift(updatedArticle);
        await commitData(
            newFilePath,
            JSON.stringify(newArticles, null, 2),
            `refactor(content): move article '${slug}' to ${updatedArticle.category}`
        );
    } else {
        // Update in the same category file
        const categorySlug = updatedArticle.category.toLowerCase().replace(/ /g, '-');
        const filePath = `src/data/${categorySlug}.json`;
        const articles = await readJsonFromGithub<Article[]>(filePath, []);
        const articleIndex = articles.findIndex(a => a.slug === slug);

        if (articleIndex === -1) {
             articles.unshift(updatedArticle); // Add it if it's not found (e.g., recovering a draft into a category)
        } else {
            articles[articleIndex] = updatedArticle;
        }

        await commitData(
            filePath,
            JSON.stringify(articles, null, 2),
            `docs(content): update article '${slug}'`
        );
    }
    
    return updatedArticle;
}

export async function deleteArticle(slug: string): Promise<void> {
    const article = await getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
        throw new Error(`Article with slug "${slug}" not found for deletion.`);
    }

    const categorySlug = article.category.toLowerCase().replace(/ /g, '-');
    const filePath = `src/data/${categorySlug}.json`;
    const articles = await readJsonFromGithub<Article[]>(filePath, []);
    const updatedArticles = articles.filter(a => a.slug !== slug);

    if (articles.length === updatedArticles.length) {
        // This can happen if the article is found via getArticleBySlug but not in its supposed file.
        // This indicates a data consistency issue, but we'll proceed with just logging it for now.
        console.warn(`Article with slug "${slug}" not found in its category file for deletion.`);
        return; // Exit if there's nothing to delete from this file.
    }

    await commitData(
        filePath,
        JSON.stringify(updatedArticles, null, 2),
        `feat(content): delete article '${slug}'`
    );
}
