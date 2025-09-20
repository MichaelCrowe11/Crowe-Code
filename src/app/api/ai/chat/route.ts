import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { generateCode } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  context: z.object({
    code: z.string().optional(),
    language: z.string().optional(),
    fileName: z.string().optional(),
    projectId: z.string().optional(),
  }).optional(),
  action: z.enum(["chat", "generate", "explain", "refactor", "debug", "test"]).default("chat"),
});

// POST /api/ai/chat - AI chat for coding assistance
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = chatSchema.parse(body);

    // Get user and check usage limits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { usageQuota: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check AI request limits
    if (user.usageQuota) {
      const { aiRequestsUsed, aiRequestsLimit } = user.usageQuota;
      if (aiRequestsLimit !== -1 && aiRequestsUsed >= aiRequestsLimit) {
        return NextResponse.json(
          { error: "AI request limit exceeded. Please upgrade your plan." },
          { status: 429 }
        );
      }
    }

    const { messages, context, action } = validatedData;

    // Build system prompt based on action
    let systemPrompt = "You are Crowe Intelligence, an expert AI coding assistant. ";

    switch (action) {
      case "generate":
        systemPrompt += "Generate clean, efficient, and well-commented code based on the user's requirements. Follow best practices and modern conventions.";
        break;
      case "explain":
        systemPrompt += "Explain code clearly and concisely. Break down complex concepts, describe what the code does, and highlight important patterns.";
        break;
      case "refactor":
        systemPrompt += "Refactor code to improve readability, performance, and maintainability. Explain the changes and why they improve the code.";
        break;
      case "debug":
        systemPrompt += "Help debug code by identifying issues, explaining error messages, and suggesting fixes. Be thorough in your analysis.";
        break;
      case "test":
        systemPrompt += "Generate comprehensive test cases and test code. Include edge cases and ensure good test coverage.";
        break;
      default:
        systemPrompt += "Help with coding questions, provide solutions, and offer guidance on best practices.";
    }

    // Add context to the conversation
    if (context?.code) {
      systemPrompt += `\n\nCurrent code context:\n\`\`\`${context.language || 'plaintext'}\n${context.code}\n\`\`\``;
    }

    if (context?.fileName) {
      systemPrompt += `\nFile: ${context.fileName}`;
    }

    // Prepare messages for AI
    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    // Generate response based on action
    let response: string;

    if (action === "generate" && context?.code) {
      // Use generateCode for code generation
      response = await generateCode(
        messages[messages.length - 1].content,
        context.language || "typescript",
        context.code
      );
    } else {
      // Use chat for other actions
      const lastMessage = messages[messages.length - 1].content;
      const prompt = `${systemPrompt}\n\nUser: ${lastMessage}\n\nAssistant:`;

      response = await generateCode(
        prompt,
        context?.language || "plaintext"
      );
    }

    // Track usage
    if (user.usageQuota) {
      await prisma.usageQuota.update({
        where: { id: user.usageQuota.id },
        data: {
          aiRequestsUsed: { increment: 1 },
        },
      });
    }

    // Log usage record
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (customer) {
      await prisma.usageRecord.create({
        data: {
          customerId: customer.id,
          type: "AI_REQUEST",
          quantity: 1,
          description: `AI ${action} assistance`,
          metadata: {
            action,
            language: context?.language,
            fileName: context?.fileName,
          },
        },
      });
    }

    // Format response with metadata
    const result = {
      message: {
        role: "assistant",
        content: response,
      },
      metadata: {
        action,
        timestamp: new Date(),
        usage: {
          used: (user.usageQuota?.aiRequestsUsed || 0) + 1,
          limit: user.usageQuota?.aiRequestsLimit || 1000,
        },
      },
    };

    // If generating code, parse and format it
    if (action === "generate" || action === "refactor") {
      const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeMatch) {
        result.metadata.code = codeMatch[1];
        result.metadata.language = context?.language || "plaintext";
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}