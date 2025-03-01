interface AiOptions {
  /**
   * Base URL of the AI service
   * @example "https://openrouter.ai/api"
   */
  baseUrl: string;
  /**
   * Optional API key for authentication
   * @example "sk-1234567890abcdef1234567890abcdef"
   */
  apiKey?: string;
  /**
   * Model name. It must support `response_format` and `structured_outputs` parameters
   * @example "gpt-3.5-turbo"
   */
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

type AiCompletionResponse =
  | AiCompletionSuccessResponse
  | AiCompletionErrorResponse

interface AiCompletionSuccessResponse {
  choices: {
    message: {
      content: string;
    }
  }[]
  error?: never;
}

interface AiCompletionErrorResponse {
  error: {
    message: string;
    code: number;
  }
  choices?: never;
}
