import { readFile } from "fs/promises";
import { Task } from "../types/task.js";

function isNumber(value: unknown): value is number {
    return typeof value === "number"
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

function isTask(task: unknown): task is Task {
    if (
        typeof task !== "object" ||
        task === null ||

        !("id" in task) ||
        !isNumber(task.id) ||

        !("repo" in task) ||
        !isString(task.repo) ||

        !("repoUrl" in task) ||
        !isString(task.repoUrl) ||

        !("baseCommit" in task) ||
        !isString(task.baseCommit) ||

        !("fixCommit" in task) ||
        !isString(task.fixCommit) ||

        !("issueTitle" in task) ||
        !isString(task.issueTitle) ||

        !("issueDescription" in task) ||
        !isString(task.issueDescription) ||

        !("difficulty" in task) ||
        !["EASY", "MEDIUM", "HARD"].includes(task.difficulty as string) ||

        !("status" in task) ||
        !["PENDING", "RUNNING", "COMPLETED", "FAILED"].includes(task.status as string) ||

        !("targetFiles" in task) ||
        !Array.isArray(task.targetFiles) ||
        !task.targetFiles.every(isString) ||

        !("hiddenTestFiles" in task) ||
        !Array.isArray(task.hiddenTestFiles) ||
        !task.hiddenTestFiles.every(isString) ||

        !("failToPass" in task) ||
        !Array.isArray(task.failToPass) ||
        !task.failToPass.every(isString) ||

        !("passToPass" in task) ||
        !Array.isArray(task.passToPass) ||
        !task.passToPass.every(isString) ||

        ("patch" in task && !isString(task.patch))
    ) {
        return false;
    }
    return true;
}

export async function loadTasks(): Promise<Task[]> {
    try {
        const data = await readFile("tasks/tasks.json", "utf-8");

        const tasks: unknown = JSON.parse(data);

        if (typeof tasks !== "object" || tasks === null) {
            throw new Error("Invalid task data");
        }
        if (!Array.isArray(tasks)) {
            throw new Error("Task data must be an array");
        }

        if (!tasks.every(isTask)) {
            throw new Error("Invalid task data");
        }

        return tasks;
    }
    catch (error) {
        throw new Error("Failed to load benchmark tasks", {
            cause: error
        });
    }
}