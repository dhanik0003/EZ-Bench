
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { getFileFromCommit } from "../git/repoManager.js";

const execFileAsync = promisify(execFile);

interface TestExecution {
    passedTests: number;
    failedTests: number;
    executionTime: number;
    output: string;
    passed: boolean;
}

export async function installDependencies(repoPath: string): Promise<void> {
    await execFileAsync("npm", ["install"], {
        cwd: repoPath
    });
}


function extractTestCounts(output: string): {
    passedTests: number;
    failedTests: number;
} {
    const match = output.match(/Tests\s+(.+?)\s+\((\d+)\)/);

    if (!match) {
        return {
            passedTests: 0,
            failedTests: 0
        };
    }

    const passedMatch = match[1].match(/(\d+)\s+passed/);
    const failedMatch = match[1].match(/(\d+)\s+failed/);

    return {
        passedTests: Number(passedMatch?.[1] ?? 0),
        failedTests: Number(failedMatch?.[1] ?? 0)
    };
}


export async function runTests(
    repoPath: string
): Promise<TestExecution> {

    const startTime = Date.now();

    try {
        const { stdout, stderr } = await execFileAsync(
            "npm",
            ["test"],
            { cwd: repoPath }
        );
        const output = `${stdout}\n${stderr}`.trim();
        const counts = extractTestCounts(output);

        return {
            passed: true,
            output,
            executionTime: Date.now() - startTime,
            ...counts
        };
    }
    catch (error: unknown) {
        const details = error as {
            stdout?: string;
            stderr?: string;
            message?: string;
        };

        const output = [
            details.stdout,
            details.stderr,
            details.message
        ].filter(Boolean).join("\n");

        const counts = extractTestCounts(output);

        return {
            passed: false,
            output,
            executionTime: Date.now() - startTime,
            ...counts
        };
    }
}

export async function runTestsWithCommitTests(
    repoPath: string,
    commitHash: string,
    testFiles: string[]
) {
    const originalFiles = new Map<string, string>();

    try {
        for (const filePath of testFiles) {
            const fullPath = join(repoPath, filePath);

            const originalContent = await readFile(fullPath, "utf-8");

            originalFiles.set(filePath, originalContent);

            const evaluationTests = await getFileFromCommit(
                repoPath,
                commitHash,
                filePath
            );

            await writeFile(fullPath, evaluationTests, "utf-8");
        }

        return await runTests(repoPath);
    }
    finally {
        for (const [filePath, content] of originalFiles) {
            const fullPath = join(repoPath, filePath);

            await writeFile(fullPath, content, "utf-8");
        }
    }
}
