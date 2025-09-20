import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { generateCode, generateCompletion } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const completionSchema = z.object({
  code: z.string(),
  language: z.string(),
  cursor: z.object({
    line: z.number(),
    column: z.number(),
  }),
  context: z.object({
    before: z.string().optional(),
    after: z.string().optional(),
    fileName: z.string().optional(),
  }).optional(),
  maxTokens: z.number().min(50).max(2000).default(500),
});

// POST /api/ai/complete - Get AI code completion
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
    const validatedData = completionSchema.parse(body);

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

    // Build the prompt for code completion
    const { code, language, cursor, context } = validatedData;
    const lines = code.split('\n');
    const currentLine = lines[cursor.line] || '';
    const beforeCursor = currentLine.substring(0, cursor.column);
    const afterCursor = currentLine.substring(cursor.column);

    // Get surrounding context
    const contextLines = 10;
    const startLine = Math.max(0, cursor.line - contextLines);
    const endLine = Math.min(lines.length, cursor.line + contextLines);
    const surroundingCode = lines.slice(startLine, endLine).join('\n');

    const prompt = `You are an expert ${language} developer providing intelligent code completions.

Context:
File: ${context?.fileName || 'untitled'}
Language: ${language}

Current code context:
\`\`\`${language}
${surroundingCode}
\`\`\`

The cursor is at line ${cursor.line - startLine + 1}, column ${cursor.column}.
Current line before cursor: "${beforeCursor}"
Current line after cursor: "${afterCursor}"

Provide a smart code completion that continues from the cursor position. Consider:
1. The syntax and conventions of ${language}
2. Variable names and functions already defined
3. Common patterns and best practices
4. The likely intent based on context

Return ONLY the completion text that should be inserted at the cursor position, without any explanation.`;

    // Call AI provider
    const completion = await generateCompletion(prompt, {
      maxTokens: validatedData.maxTokens,
      temperature: 0.3, // Lower temperature for more predictable completions
      stopSequences: ['\n\n', '```'],
    });

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
          description: `Code completion for ${language}`,
          metadata: {
            language,
            fileName: context?.fileName,
          },
        },
      });
    }

    // Parse the completion to extract different suggestions
    const suggestions = [
      {
        text: completion,
        type: "primary",
        confidence: 0.95,
      },
    ];

    // Try to generate alternative suggestions (simplified for now)
    if (completion.length < 100) {
      // For short completions, might have alternatives
      const alternativePrompt = prompt + "\n\nProvide an alternative completion:";
      try {
        const alternative = await generateCompletion(alternativePrompt, {
          maxTokens: validatedData.maxTokens,
          temperature: 0.5,
        });

        if (alternative && alternative !== completion) {
          suggestions.push({
            text: alternative,
            type: "alternative",
            confidence: 0.75,
          });
        }
      } catch (err) {
        // Ignore alternative generation errors
      }
    }

    return NextResponse.json({
      suggestions,
      usage: {
        used: user.usageQuota?.aiRequestsUsed || 0,
        limit: user.usageQuota?.aiRequestsLimit || 1000,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error generating completion:", error);
    return NextResponse.json(
      { error: "Failed to generate completion" },
      { status: 500 }
    );
  }
}