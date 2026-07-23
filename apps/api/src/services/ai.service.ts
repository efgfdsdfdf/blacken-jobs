import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { Stream } from "@anthropic-ai/sdk/streaming";

export class AIService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Generates a streaming response from Claude
   */
  async streamChat(messages: Anthropic.MessageParam[], systemPrompt?: string) {
    if (!this.anthropic) {
      throw new AppError(500, "Anthropic API key is not configured");
    }

    try {
      const stream = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt || "You are BLACK AI, a helpful, brilliant coding assistant and AI agent. Keep your answers concise and accurate.",
        messages: messages,
        stream: true,
      });

      return stream;
    } catch (error: any) {
      throw new AppError(500, `Failed to communicate with AI: ${error.message}`);
    }
  }

  /**
   * Generates a non-streaming response from Claude
   */
  async generateResponse(messages: Anthropic.MessageParam[], systemPrompt?: string): Promise<string> {
    if (!this.anthropic) {
      return "";
    }

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt || "You are an expert career agent.",
        messages: messages,
        stream: false,
      });

      return (response.content[0] as any).text || "";
    } catch (error: any) {
      return "";
    }
  }
}

export const aiService = new AIService();
