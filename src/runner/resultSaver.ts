import { writeFile, mkdir } from "fs/promises";
import { TaskResult } from "../types/task.js";

export async function saveResults(results: TaskResult[]): Promise<void> {
    await mkdir("results", { recursive: true });

    const data = JSON.stringify(results, null, 4);

    await writeFile("results/results.json", data, "utf-8");
}