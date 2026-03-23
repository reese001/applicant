import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/anthropic";
import { atsCheckSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan !== "PRO") {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    const body = await req.json();
    const { resumeJson, jobDescription } = atsCheckSchema.parse(body);

    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description for ATS compatibility.

Return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "keywordMatch": <percentage 0-100>,
  "missingKeywords": ["keyword1", "keyword2"],
  "formattingWarnings": ["warning1", "warning2"],
  "sections": [
    {
      "name": "section name",
      "score": <number 0-100>,
      "feedback": "specific feedback"
    }
  ],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
}

Analyze:
1. Keyword overlap between resume and job description
2. Section completeness (summary, experience, education, skills)
3. Use of action verbs and quantified achievements
4. Overall structure and formatting concerns
5. Missing critical requirements from the job description

Return ONLY valid JSON, no markdown or explanation.`;

    const userPrompt = `Job Description:\n${jobDescription}\n\nResume Content:\n${JSON.stringify(resumeJson, null, 2)}`;

    const result = await generateAIResponse(systemPrompt, userPrompt);

    try {
      const analysis = JSON.parse(result);
      return NextResponse.json(analysis);
    } catch {
      return NextResponse.json({
        score: 0,
        keywordMatch: 0,
        missingKeywords: [],
        formattingWarnings: ["Unable to parse analysis"],
        sections: [],
        suggestions: ["Please try again"],
        raw: result,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/ai/ats-check error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
