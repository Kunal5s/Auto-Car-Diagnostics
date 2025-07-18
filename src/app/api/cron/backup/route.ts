
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';

// This is the cron job endpoint that will be called by Vercel
export async function GET() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
  const REPO_NAME = process.env.GITHUB_REPO_NAME;
  const BRANCH = 'main';

  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return NextResponse.json({ message: 'GitHub credentials not configured.' }, { status: 500 });
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const dataDir = path.join(process.cwd(), 'src/data');

  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const fileName of jsonFiles) {
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
        // File doesn't exist, which is fine, we'll create it.
      }
      
      const commitMessage = `cron: backup ${fileName}`;

      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: repoFilePath,
        message: commitMessage,
        content: Buffer.from(fileContent).toString('base64'),
        sha: existingFileSha,
        branch: BRANCH,
      });
    }

    return NextResponse.json({ message: 'Backup to GitHub successful.' });

  } catch (error) {
    console.error('GitHub backup cron job failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: 'GitHub backup failed.', error: errorMessage }, { status: 500 });
  }
}
