import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";

export async function generateBrief(prompt: string): Promise<string> {
  if (env.llm.provider === "anthropic" && env.llm.anthropicApiKey) {
    const client = new Anthropic({ apiKey: env.llm.anthropicApiKey });
    const msg = await client.messages.create({
      model: env.llm.model || "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content[0];
    return block.type === "text" ? block.text : "";
  }

  const client = new OpenAI({ apiKey: env.llm.openaiApiKey });
  const completion = await client.chat.completions.create({
    model: env.llm.model || "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content ?? "";
}
