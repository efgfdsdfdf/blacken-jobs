import { Response, NextFunction } from "express";
import { AuthenticatedRequest as Request } from "../middlewares/auth.middleware";
import { prisma } from "@repo/db";
import { aiService } from "../services/ai.service";
import { AppError } from "../utils/errors";
import { z } from "zod";

export class ChatController {
  
  // Create a new chat
  async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw new AppError("Unauthorized", 401);

      const chat = await prisma.chat.create({
        data: {
          userId: user.id,
          title: "New Chat",
        }
      });

      res.status(201).json({ success: true, data: chat });
    } catch (error) {
      next(error);
    }
  }

  // Get all chats for the user
  async getChats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw new AppError("Unauthorized", 401);

      const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      res.status(200).json({ success: true, data: chats });
    } catch (error) {
      next(error);
    }
  }

  // Get single chat and its messages
  async getChat(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = req.user;
      if (!user) throw new AppError("Unauthorized", 401);

      const chat = await prisma.chat.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          }
        }
      });

      if (!chat) {
        throw new AppError("Chat not found", 404);
      }

      res.status(200).json({ success: true, data: chat });
    } catch (error) {
      next(error);
    }
  }

  // Send a message to a chat and stream response via SSE
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.id as string;
      const { content } = req.body;
      const user = req.user;

      if (!user) throw new AppError("Unauthorized", 401);
      if (!content || typeof content !== "string") {
        throw new AppError("Content is required", 400);
      }

      const chat = await prisma.chat.findUnique({ where: { id: chatId, userId: user.id } });
      if (!chat) throw new AppError("Chat not found", 404);

      // Save user message to database
      await prisma.message.create({
        data: {
          chatId,
          role: "USER",
          content,
        }
      });

      // Update chat's updatedAt timestamp and title if it's the first message
      const messageCount = await prisma.message.count({ where: { chatId } });
      if (messageCount === 1) {
        // Simple heuristic for title: first 30 chars
        const title = content.length > 30 ? content.substring(0, 30) + "..." : content;
        await prisma.chat.update({
          where: { id: chatId },
          data: { title, updatedAt: new Date() }
        });
      } else {
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() }
        });
      }

      // Fetch full history to send to Claude
      const history = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" }
      });

      // Format for Anthropic
      const messages = history.map(msg => ({
        role: msg.role === "USER" ? "user" : "assistant",
        content: msg.content
      })) as any[]; // Type cast for Anthropic MessageParam

      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders(); // flush headers to establish SSE connection immediately

      // Start streaming
      const stream = await aiService.streamChat(messages);
      
      let fullAssistantMessage = "";

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          const text = chunk.delta.text;
          fullAssistantMessage += text;
          // Format SSE data: "data: {JSON}\n\n"
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      // Save assistant message to database
      await prisma.message.create({
        data: {
          chatId,
          role: "ASSISTANT",
          content: fullAssistantMessage
        }
      });

      // Send finish event
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

    } catch (error) {
      console.error("Streaming error:", error);
      // Can't use next(error) cleanly if headers are already sent, so handle directly
      if (!res.headersSent) {
        next(error);
      } else {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        res.write(`data: ${JSON.stringify({ error: `An error occurred during generation: ${errorMsg}` })}\n\n`);
        res.end();
      }
    }
  }

}

export const chatController = new ChatController();
