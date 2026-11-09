import { simpleGit } from "simple-git";
import { spawn } from "node:child_process";

export async function cloneRepository(repoUrl: string, destination: string): Promise<void> {
    const git = simpleGit();
    await git.clone(repoUrl, destination);
}

export async function checkoutCommit(repoPath: string, commitHash: string): Promise<void> {
    const git = simpleGit(repoPath);
    await git.checkout(commitHash)
}

export async function resetRepository(repoPath: string): Promise<void> {
    const git = simpleGit(repoPath);

    await git.reset(["--hard", "HEAD"]);
    await git.clean("f", ["-d"]);
}

export async function getFileFromCommit(repoPath: string, commitHash: string, filePath: string): Promise<string> {
    const git = simpleGit(repoPath);
    return await git.show([`${commitHash}:${filePath}`]);
}

export async function applyPatch(
    repoPath: string,
    patch: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        const git = spawn("git", ["apply", "--"], {
            cwd: repoPath
        });

        let errorOutput = "";

        git.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        git.on("error", reject);

        git.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(
                    `Git apply failed:\n${errorOutput}`
                ));
            }
        });

        git.stdin.write(patch);
        git.stdin.end();
    });
}

export async function restoreFiles(
    repoPath: string,
    filePaths: string[]
): Promise<void> {
    const git = simpleGit(repoPath);

    await git.checkout(["--", ...filePaths]);
}