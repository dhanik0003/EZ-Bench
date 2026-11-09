
import "dotenv/config";
import type { LLMProvider } from "./provider.js";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing from .env");
}

export class OpenRouterProvider implements LLMProvider {
    name = "OpenRouter";
    model = "openrouter/free";

    async generate(
        systemPrompt: string,
        userPrompt: string
    ): Promise<string> {

        console.log("Sending request to OpenRouter...");

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: this.model,
                    temperature: 0,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt
                        }
                    ]
                })
            }
        );

        const data = await response.json() as {
            error?: { message?: string };
            choices?: {
                message?: { content?: string | null };
            }[];
        };

        if (!response.ok) {
            throw new Error(
                data.error?.message ?? `OpenRouter API error: ${response.status}`
            );
        }

        console.log("OpenRouter response received.");

        const content = data.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("OpenRouter returned an empty response");
        }

        return content;
    }
}
