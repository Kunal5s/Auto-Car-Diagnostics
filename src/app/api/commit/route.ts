
import { Octokit } from '@octokit/rest';
import { NextResponse } from 'next/server';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
const branch = process.env.GITHUB_REPO_BRANCH || 'main';

async function getFileSha(filePath: string): Promise<string | undefined> {
  try {
    const response = await octokit.repos.getContent({
      owner: owner!,
      repo: repo!,
      path: filePath,
      ref: branch,
    });
    // The response.data type is complex, so we cast it to what we need.
    const data = response.data as { sha: string };
    return data.sha;
  } catch (error: any) {
    if (error.status === 404) {
      return undefined; // File doesn't exist
    }
    throw error;
  }
}

export async function POST(request: Request) {
  if (!owner || !repo || !process.env.GITHUB_TOKEN) {
    return NextResponse.json({ message: 'GitHub environment variables are not configured.' }, { status: 500 });
  }

  try {
    const { filePath, content, commitMessage } = await request.json();

    if (!filePath || content === undefined || !commitMessage) {
      return NextResponse.json({ message: 'Missing required fields: filePath, content, or commitMessage' }, { status: 400 });
    }

    const currentSha = await getFileSha(filePath);

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha: currentSha,
      branch: branch,
    });

    return NextResponse.json({ success: true, commit: data.commit.sha }, { status: 200 });
  } catch (error: any) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ message: 'Failed to commit to GitHub.', error: error.message }, { status: 500 });
  }
}
