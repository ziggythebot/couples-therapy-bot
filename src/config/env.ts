import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  llm: {
    provider: (process.env.LLM_PROVIDER ?? "openai") as "openai" | "anthropic",
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "gpt-4o",
  },
  memoryRoot: process.env.MEMORY_ROOT ?? "./memory",
};
