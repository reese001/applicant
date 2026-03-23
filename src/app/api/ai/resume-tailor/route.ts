import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/anthropic";
import { resumeTailorSchema } from "@/lib/validators";

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
    const { resumeJson, jobDescription } = resumeTailorSchema.parse(body);

    const systemPrompt = `You are a resume optimization expert. Analyze the job description and resume, then provide specific, actionable edits to tailor the resume for this role.

Return a JSON array of suggested edits with this structure:
[
  {
    "section": "experience|summary|skills|education",
    "original": "the original text",
    "suggested": "the suggested replacement",
    "reason": "why this change helps"
  }
]

Focus on:
1. Keyword matching from the job description
2. Reordering bullet points to prioritize relevant experience
3. Rewording to match the job's language
4. Adding missing relevant skills
5. Strengthening quantified achievements

Return ONLY valid JSON, no markdown or explanation.`;

    const userPrompt = `Job Description:\n${jobDescription}\n\nResume Content:\n${JSON.stringify(resumeJson, null, 2)}`;

    const result = await generateAIResponse(systemPrompt, userPrompt);

    try {
      const edits = JSON.parse(result);
      return NextResponse.json({ edits });
    } catch {
      return NextResponse.json({ edits: [], raw: result });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/ai/resume-tailor error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
