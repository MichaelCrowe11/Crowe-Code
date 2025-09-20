import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth-config";
import { generateCode } from "@/lib/ai-provider";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyzeSchema = z.object({
  code: z.string(),
  language: z.string(),
  fileName: z.string().optional(),
  analysisType: z.enum(["comprehensive", "security", "performance", "style"]).default("comprehensive"),
});

// POST /api/ai/analyze - Analyze code for suggestions
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
    const validatedData = analyzeSchema.parse(body);

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

    const { code, language, fileName, analysisType } = validatedData;

    // Build analysis prompt
    const prompt = `You are Crowe Intelligence, an expert code analyzer. Analyze the following ${language} code and provide specific, actionable suggestions.

File: ${fileName || 'untitled'}
Analysis Type: ${analysisType}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "id": "unique_id",
      "type": "optimization|security|bug|refactor|style",
      "severity": "info|warning|error",
      "line": line_number_or_null,
      "column": column_number_or_null,
      "message": "Brief description",
      "description": "Detailed explanation",
      "fix": {
        "code": "suggested_code",
        "explanation": "why this fix helps"
      }
    }
  ]
}

Focus on:
${analysisType === "comprehensive" ? "- Performance optimizations\n- Security vulnerabilities\n- Potential bugs\n- Code quality improvements\n- Best practices" : ""}
${analysisType === "security" ? "- SQL injection risks\n- XSS vulnerabilities\n- Authentication issues\n- Data validation\n- Sensitive data exposure" : ""}
${analysisType === "performance" ? "- Algorithm optimization\n- Memory usage\n- Unnecessary re-renders\n- Database query optimization\n- Caching opportunities" : ""}
${analysisType === "style" ? "- Code formatting\n- Naming conventions\n- Documentation\n- Code organization\n- Design patterns" : ""}

Return ONLY valid JSON, no additional text.`;

    // Call AI provider
    const response = await generateCode(prompt, language);

    // Parse response
    let suggestions = [];
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = parsed.suggestions || [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide fallback suggestions
      suggestions = [
        {
          id: "fallback-1",
          type: "info",
          severity: "info",
          message: "Code analysis completed",
          description: "The AI analysis is processing. Please try again in a moment.",
        }
      ];
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
          description: `Code analysis (${analysisType})`,
          metadata: {
            analysisType,
            language,
            fileName,
            codeLength: code.length,
          },
        },
      });
    }

    return NextResponse.json({
      suggestions,
      metadata: {
        analysisType,
        timestamp: new Date(),
        usage: {
          used: (user.usageQuota?.aiRequestsUsed || 0) + 1,
          limit: user.usageQuota?.aiRequestsLimit || 1000,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error analyzing code:", error);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}