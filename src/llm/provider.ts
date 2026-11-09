export interface LLMProvider {
    name: string;
    model: string;

    generate(
        systemPrompt: string,
        userPrompt: string
    ): Promise<string>;
}