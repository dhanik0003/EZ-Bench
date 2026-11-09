
import Groq from "groq-sdk";
import "dotenv/config";
import type { LLMProvider } from "./provider.js";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from .env");
}

const groq = new Groq({ apiKey });

export class GroqProvider implements LLMProvider {
    name = "Groq";
    model = "openai/gpt-oss-120b";

    async generate(
        systemPrompt: string,
        userPrompt: string
    ): Promise<string> {

        const response = await groq.chat.completions.create({
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
        });

        const content = response.choices[0]?.message.content;

        if (!content || !content.trim()) {
            throw new Error("Groq returned an empty response");
        }

        return content;
    }
}

