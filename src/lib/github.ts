
'use server';

import { Octokit } from '@octokit/rest';

interface FileChange {
    path: string;
    content: string;
}

export async function commitFilesToGitHub(files: FileChange[], commitMessage: string): Promise<void> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;
    const BRANCH = 'main';

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        const missingVars = [
            !GITHUB_TOKEN && "GITHUB_TOKEN",
            !REPO_OWNER && "GITHUB_REPO_OWNER",
            !REPO_NAME && "GITHUB_REPO_NAME"
        ].filter(Boolean).join(", ");
        
        const errorMessage = `GitHub repository details not configured. Missing: ${missingVars}. Cannot save changes.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    try {
        const { data: refData } = await octokit.git.getRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${BRANCH}`,
        });
        const latestCommitSha = refData.object.sha;

        const { data: commitData } = await octokit.git.getCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            commit_sha: latestCommitSha,
        });
        const baseTreeSha = commitData.tree.sha;

        const blobPromises = files.map(file =>
            octokit.git.createBlob({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                content: file.content,
                encoding: 'utf-8',
            })
        );
        const blobs = await Promise.all(blobPromises);

        const tree = files.map((file, index) => ({
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blobs[index].data.sha,
        }));

        const { data: newTree } = await octokit.git.createTree({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            base_tree: baseTreeSha,
            tree,
        });

        const { data: newCommit } = await octokit.git.createCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            message: commitMessage,
            tree: newTree.sha,
            parents: [latestCommitSha],
        });

        await octokit.git.updateRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${BRANCH}`,
            sha: newCommit.sha,
        });

    } catch (error) {
        console.error('Failed to commit files to GitHub:', error);
        throw new Error('Could not save changes to the GitHub repository.');
    }
}
