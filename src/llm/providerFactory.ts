import type { LLMProvider } from "./provider.js";
import { GroqProvider } from "./groqProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
import { OpenRouterProvider } from "./openRouterProvider.js";

export function createProvider(): LLMProvider {
    const providerName = (
        process.env.LLM_PROVIDER ?? "groq"
    ).toLowerCase();

    switch (providerName) {
        case "groq":
            return new GroqProvider();

        case "gemini":
            return new GeminiProvider();

        case "openrouter":
            return new OpenRouterProvider();

        default:
            throw new Error(
                `Unsupported LLM provider: ${providerName}`
            );
    }
}