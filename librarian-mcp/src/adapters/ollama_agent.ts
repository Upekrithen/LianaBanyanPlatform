/**
 * OllamaAgent Adapter — BP058 W15 V15.2
 *
 * Ollama backend adapter implementing same interface as Anthropic SEG/Spider/Sprite agents.
 * Configuration via LB_AGENT_BACKEND env var: ollama | anthropic | auto
 *
 * auto mode: tries Ollama first, falls back to Anthropic if not available.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentBackend = "ollama" | "anthropic" | "auto";

export interface Tool {
  name: string;
  description: string;
  input_schema?: Record<string, unknown>;
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  model: string;
  backend: AgentBackend;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: string;
}

export interface OllamaConfig {
  base_url: string;
  model: string;
  timeout_ms: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  base_url: process.env.LB_OLLAMA_URL ?? "http://localhost:11434",
  model: process.env.LB_OLLAMA_MODEL ?? "llama3.3",
  timeout_ms: 60_000,
};

const DEFAULT_BACKEND: AgentBackend =
  (process.env.LB_AGENT_BACKEND as AgentBackend | undefined) ?? "auto";

// ─── OllamaAgent ─────────────────────────────────────────────────────────────

export class OllamaAgent {
  private config: OllamaConfig;
  private backend: AgentBackend;

  constructor(config?: Partial<OllamaConfig>, backend?: AgentBackend) {
    this.config = { ...DEFAULT_OLLAMA_CONFIG, ...config };
    this.backend = backend ?? DEFAULT_BACKEND;
  }

  /**
   * dispatch — route prompt to Ollama or Anthropic depending on backend config.
   *
   * auto mode: tries Ollama first, falls back to Anthropic with logged notice.
   */
  async dispatch(
    prompt: string,
    tools?: Tool[],
    messages?: AgentMessage[]
  ): Promise<AgentResponse> {
    const effectiveMessages: AgentMessage[] = messages
      ? [...messages, { role: "user", content: prompt }]
      : [{ role: "user", content: prompt }];

    if (this.backend === "ollama") {
      return this._dispatch_ollama(effectiveMessages, tools);
    }

    if (this.backend === "anthropic") {
      return this._dispatch_anthropic_placeholder(effectiveMessages, tools);
    }

    // auto: try Ollama first
    const ollamaUp = await this._ollama_health();
    if (ollamaUp) {
      return this._dispatch_ollama(effectiveMessages, tools);
    }

    // Fallback to Anthropic
    console.warn("[OllamaAgent] Ollama unavailable · falling back to Anthropic backend");
    return this._dispatch_anthropic_placeholder(effectiveMessages, tools);
  }

  // ─── Ollama Backend ──────────────────────────────────────────────────────────

  private async _ollama_health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.base_url}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async _dispatch_ollama(
    messages: AgentMessage[],
    tools?: Tool[]
  ): Promise<AgentResponse> {
    // Build Ollama chat payload
    const payload: Record<string, unknown> = {
      model: this.config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    // Ollama tool format (compatible with function-calling models)
    if (tools && tools.length > 0) {
      payload.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema ?? { type: "object", properties: {} },
        },
      }));
    }

    try {
      const res = await fetch(`${this.config.base_url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout_ms),
      });

      if (!res.ok) {
        const err = await res.text();
        return {
          content: "",
          model: this.config.model,
          backend: "ollama",
          error: `Ollama HTTP ${res.status}: ${err}`,
        };
      }

      const data = await res.json() as {
        message?: { content?: string };
        eval_count?: number;
        prompt_eval_count?: number;
      };

      return {
        content: data.message?.content ?? "",
        model: this.config.model,
        backend: "ollama",
        usage: {
          input_tokens: data.prompt_eval_count,
          output_tokens: data.eval_count,
        },
      };
    } catch (err) {
      return {
        content: "",
        model: this.config.model,
        backend: "ollama",
        error: `Ollama dispatch error: ${String(err)}`,
      };
    }
  }

  // ─── Anthropic Placeholder ───────────────────────────────────────────────────
  // Scope-cut: Anthropic SDK integration deferred — real agents use existing SEG/Spider/Sprite.
  // This placeholder provides the interface for future wiring.

  private async _dispatch_anthropic_placeholder(
    messages: AgentMessage[],
    _tools?: Tool[]
  ): Promise<AgentResponse> {
    return {
      content: "",
      model: "anthropic-placeholder",
      backend: "anthropic",
      error:
        "Anthropic backend not wired in OllamaAgent adapter. " +
        "Use existing SEG/Spider/Sprite agents for Anthropic dispatch. " +
        "Set LB_AGENT_BACKEND=ollama to use Ollama, or install Ollama at ollama.ai.",
    };
  }
}

// ─── Convenience Factory ──────────────────────────────────────────────────────

/** Create default OllamaAgent from env vars. */
export function createAgent(backend?: AgentBackend): OllamaAgent {
  return new OllamaAgent({}, backend);
}

/** Quick one-shot dispatch (auto backend). */
export async function dispatch(
  prompt: string,
  tools?: Tool[]
): Promise<AgentResponse> {
  return createAgent().dispatch(prompt, tools);
}
