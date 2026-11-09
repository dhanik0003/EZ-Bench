import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import type { LLMProvider } from "./provider.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

export class GeminiProvider implements LLMProvider {
    name = "Google Gemini";
    model = "gemini-3.8-flash";

    async generate(
        systemPrompt: string,
        userPrompt: string
    ): Promise<string> {

        console.log("Sending request to Gemini...");

        const response = await ai.models.generateContent({
            model: this.model,
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0,
                httpOptions: {
                    timeout: 120000
                }
            }
        });

        console.log("Gemini response received.");

        const content = response.text;

        if (!content || !content.trim()) {
            throw new Error("Gemini returned an empty response");
        }

        return content;
    }
}