import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const AI_MODEL = "claude-sonnet-4-20250514";

export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
) {
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "";
}

export async function streamAIResponse(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
) {
  return anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
}
