
import { access, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { simpleGit } from "simple-git";
import { cloneRepository, checkoutCommit } from "../git/repoManager.js";
import { Task } from "../types/task.js";

export async function prepareTaskRepository(
    task: Task,
    destination: string
): Promise<void> {

    // Ensure the parent directory exists.
    await mkdir(dirname(destination), { recursive: true });

    let destinationExists = true;

    try {
        await access(destination);
    } catch {
        destinationExists = false;
    }

    if (!destinationExists) {
        console.log("Repository not found. Cloning...");
        await cloneRepository(task.repoUrl, destination);
    } else {
        // Check whether the existing directory is a Git repository.
        const git = simpleGit(destination);
        const isRepo = await git.checkIsRepo();

        if (!isRepo) {
            throw new Error(
                `Destination exists but is not a Git repository: ${destination}`
            );
        }

        // Never overwrite an existing dirty working tree.
        const status = await git.status();

        if (!status.isClean()) {
            throw new Error(
                `Repository has uncommitted changes: ${destination}`
            );
        }

        console.log("Existing repository found. Reusing it...");
    }

    // Always start from the task's required base commit.
    console.log(`Checking out base commit: ${task.baseCommit}`);
    await checkoutCommit(destination, task.baseCommit);
}
