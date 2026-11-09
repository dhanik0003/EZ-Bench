export type TaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface Task {
    id: number;
    repo: string;
    repoUrl: string;
    baseCommit: string;
    fixCommit: string;
    targetFiles: string[];
    hiddenTestFiles: string[];
    issueTitle: string;
    issueDescription: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    failToPass: string[];
    passToPass: string[];
    status: TaskStatus;
    patch?: string;
}

export interface TaskResult {
    taskId: number;
    provider: string;
    model: string;
    status: TaskStatus;
    score: number;
    executionTime: number;
    passedTests: number;
    failedTests: number;
    output: string;
    error?: string;
}

export type TaskUpdate = Partial<Task>;