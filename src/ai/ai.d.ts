interface AiOptions {
  baseUrl: string;
  apiKey?: string;
  model: string;
}

interface AI {
  completions(params: AiCompletionParams): Promise<AiCompletionResponse>
}

interface AiMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface AiCompletionParams {
  messages: AiMessage[];
  responseFormat?: OpenAIStructuredOutput;
  stream?: boolean;
}

interface AiCompletionResponse {
  choices: {
    message: {
      content: string;
    }
  }[]
}
