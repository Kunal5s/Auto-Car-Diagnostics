
'use server';

/**
 * @fileOverview A robust service for committing multiple file changes to a GitHub repository.
 * This implementation uses the lower-level Git Data API to bypass the 1MB file size limit
 * of the Contents API, allowing for large article files to be backed up reliably.
 */

import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

interface FileChange {
    path: string;
    content: string;
}

/**
 * Commits multiple file changes to the GitHub repository using the Git Data API.
 * This method is more complex but supports large files and is more reliable.
 * @param files - An array of objects, each with a 'path' and 'content'.
 * @param commitMessage - The message for the git commit.
 */
export async function commitFilesToGitHub(files: FileChange[], commitMessage: string): Promise<void> {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
        console.error("GitHub repository details are not fully configured in environment variables. Backup will be skipped.");
        // We throw an error here to make it clear in the UI that the save failed.
        throw new Error("GitHub repository details are not configured, cannot save changes.");
    }

    try {
        // 1. Get the latest commit SHA of the main branch
        const { data: refData } = await octokit.git.getRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${BRANCH}`,
        });
        const latestCommitSha = refData.object.sha;

        // 2. Get the tree SHA from that commit
        const { data: commitData } = await octokit.git.getCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            commit_sha: latestCommitSha,
        });
        const baseTreeSha = commitData.tree.sha;

        // 3. Create new "blobs" (file contents) for each of our changes
        const blobPromises = files.map(file =>
            octokit.git.createBlob({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                content: file.content,
                encoding: 'utf-8',
            })
        );
        const blobs = await Promise.all(blobPromises);

        // 4. Create a new "tree" (a representation of the repository's file structure)
        const tree = files.map((file, index) => ({
            path: file.path,
            mode: '100644' as const, // This means it's a file
            type: 'blob' as const,
            sha: blobs[index].data.sha,
        }));

        const { data: newTree } = await octokit.git.createTree({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            base_tree: baseTreeSha,
            tree,
        });

        // 5. Create a new commit object pointing to our new tree
        const { data: newCommit } = await octokit.git.createCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            message: commitMessage,
            tree: newTree.sha,
            parents: [latestCommitSha], // Link it to the previous commit
        });

        // 6. Update the main branch to point to our new commit
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
