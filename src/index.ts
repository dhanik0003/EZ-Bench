
import { loadTasks } from "./runner/taskLoader.js";
import { installDependencies, runTestsWithCommitTests } from "./tests/testRunner.js";
import { applyPatch, restoreFiles } from "./git/repoManager.js";
import { processResult } from "./runner/resultProcessor.js";
import { saveResults } from "./runner/resultSaver.js";
import type { TaskResult } from "./types/task.js";
import { prepareTaskRepository } from "./runner/taskRunner.js";
import { generatePatch } from "./llm/patchGenerator.js";
import { createProvider } from "./llm/providerFactory.js";


const provider = createProvider();

const tasks = await loadTasks();

const results: TaskResult[] = [];


for (const task of tasks) {
    const repoPath = `temp/task-${task.id}`;

    console.log(`\n========== TASK ${task.id} ==========`);

    const taskStartTime = Date.now();
    try {
        await prepareTaskRepository(task, repoPath);

        console.log("Installing Dependencies...");
        await installDependencies(repoPath);

        console.log(`Generating patch using ${provider.name} (${provider.model})...`);

        const patch = await generatePatch(task, repoPath, provider);

        console.log("Generated patch:");
        console.log(patch);

        console.log("Applying generated patch...");
        await applyPatch(repoPath, patch);

        console.log("Running evaluation tests...");
        const execution = await runTestsWithCommitTests(
            repoPath,
            task.fixCommit,
            task.hiddenTestFiles
        );

        const result = processResult(task.id, {
            provider: provider.name,
            model: provider.model,
            passedTests: execution.passedTests,
            failedTests: execution.failedTests,
            executionTime: execution.executionTime,
            output: execution.output
        });

        results.push(result);

        console.log("Passed:", result.passedTests);
        console.log("Failed:", result.failedTests);
        console.log("Score:", `${result.score}%`);
        console.log("Execution time:", `${result.executionTime}ms`);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error
            ? error.message
            : String(error);

        console.error(`Task ${task.id} failed:`, errorMessage);

        results.push({
            taskId: task.id,
            status: "FAILED",
            score: 0,
            executionTime: Date.now() - taskStartTime,
            passedTests: 0,
            failedTests: 0,
            output: errorMessage,
            error: errorMessage,
            provider: provider.name,
            model: provider.model,
        });

    } finally {
        console.log("Restoring repository...");

        try {
            await restoreFiles(repoPath, task.targetFiles);
        } catch (error: unknown) {
            console.error("Repository restoration failed:", error);
        }
    }
}


await saveResults(results);

console.log("\nAll results saved to results/results.json");
