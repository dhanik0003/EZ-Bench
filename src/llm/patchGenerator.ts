
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Task } from "../types/task.js";
import type { LLMProvider } from "./provider.js";

const execFileAsync = promisify(execFile);

export async function generatePatch(
    task: Task,
    repoPath: string,
    provider: LLMProvider
): Promise<string> {

    const originalFiles = new Map<string, string>();

    try {
        for (const filePath of task.targetFiles) {
            const fullPath = join(repoPath, filePath);

            const originalSource = await readFile(
                fullPath,
                "utf-8"
            );

            originalFiles.set(filePath, originalSource);

            const systemPrompt = `You are an expert software engineer.

Fix the given issue using the provided source code.

IMPORTANT RULES:
1. Return ONLY the complete modified source code.
2. Do not return a Git diff.
3. Do not use Markdown code fences.
4. Do not include explanations.
5. Preserve all existing functionality.
6. Make only the minimum changes necessary.
7. Do not modify unrelated functions or code.
8. Preserve existing comments, documentation, and formatting.
9. Do not remove existing lines unless necessary.
10. Do not refactor unrelated code.`;

            const userPrompt = `
Issue: ${task.issueTitle}

Description:
${task.issueDescription}

File: ${filePath}

Original source code:
${originalSource}

Return the complete modified source code.
`;

            const modifiedSource = await provider.generate(
                systemPrompt,
                userPrompt
            );

            const normalizedSource = modifiedSource.replace(
                /\r?\n?$/,
                "\n"
            );

            await writeFile(
                fullPath,
                normalizedSource,
                "utf-8"
            );
        }

        const { stdout } = await execFileAsync(
            "git",
            [
                "diff",
                "--no-ext-diff",
                "--",
                ...task.targetFiles
            ],
            {
                cwd: repoPath,
                maxBuffer: 10 * 1024 * 1024
            }
        );

        if (!stdout.trim()) {
            throw new Error("LLM generated no source code changes");
        }

        return stdout;

    } finally {
        for (const [filePath, content] of originalFiles) {
            await writeFile(
                join(repoPath, filePath),
                content,
                "utf-8"
            );
        }
    }
}
