export class OpenAI implements AI {
  #options: AiOptions;

  constructor(options: AiOptions) {
    this.#options = options;
  }

  async completions(params: AiCompletionParams): Promise<AiCompletionResponse> {
    const response = await fetch(`${this.#options.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.#options.apiKey && { 'Authorization': `Bearer ${this.#options.apiKey}` },
      },
      body: JSON.stringify({
        model: this.#options.model,
        messages: params.messages,
        response_format: params.responseFormat,
        stream: params.stream,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText} ${await response.text()}`)
    }

    return await response.json()
  }
}
