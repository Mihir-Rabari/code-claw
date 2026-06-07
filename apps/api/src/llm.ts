import OpenAI from 'openai';

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set; cannot call LLM.');
  }
  return key;
}

function getBaseURL(): string | undefined {
  const raw = process.env.OPENAI_BASE_URL;
  return raw && raw.trim().length > 0 ? raw : undefined;
}

function getModel(): string {
  return process.env.OPENAI_MODEL ?? 'gemini-3.1-flash-lite';
}

let cachedClient: OpenAI | null = null;
function getClient(): OpenAI {
  if (!cachedClient) {
    const baseURL = getBaseURL();
    cachedClient = new OpenAI({
      apiKey: getApiKey(),
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return cachedClient;
}

export const llmModel = getModel();

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callLlm(messages: LlmMessage[]): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: getModel(),
    messages,
    temperature: 0.2,
  });
  return response.choices[0]?.message?.content ?? '';
}
