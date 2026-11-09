import { TaskResult } from "../types/task.js";

interface TestExecution {
    provider: string;
    model: string;
    passedTests: number;
    failedTests: number;
    executionTime: number;
    output: string;
}

export function processResult(
    taskId: number,
    execution: TestExecution
): TaskResult {

    const totalTests = execution.passedTests + execution.failedTests;

    const score = totalTests === 0
        ? 0
        : (execution.passedTests / totalTests) * 100;

    return {
        taskId,
        provider: execution.provider,
        model: execution.model,
        status: "COMPLETED",
        score,
        executionTime: execution.executionTime,
        passedTests: execution.passedTests,
        failedTests: execution.failedTests,
        output: execution.output
    };
}