export class MultiAI implements AI {
  #ais: AI[];
  #log: boolean;

  constructor(
    ais: AI[],
    options?: {
      log?: boolean;
    },
  ) {
    this.#ais = ais;
    this.#log = options?.log ?? false;
  }

  async completions(params: AiCompletionParams): Promise<AiCompletionResponse> {
    const errors: Dict<Error> = {};
    for (const ai of this.#ais) {
      try {
        return await ai.completions(params);
      } catch (e) {
        if (this.#log) console.error(`AI ${ai.constructor.name} failed:`, e);
        if (e instanceof Error) errors[ai.constructor.name] = e;
      }
    }
    throw new Error(`Failed to fetch from all AIs: ${JSON.stringify(errors)}`, {
      cause: errors,
    });
  }
}
