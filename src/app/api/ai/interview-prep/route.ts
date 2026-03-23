import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/anthropic";
import { interviewPrepSchema } from "@/lib/validators";

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
    const { jobDescription, jobTitle } = interviewPrepSchema.parse(body);

    const systemPrompt = `You are an interview preparation coach. Generate 10 likely interview questions for the given role, with a mix of behavioral, technical, and situational questions.

Return a JSON array with this structure:
[
  {
    "question": "the interview question",
    "type": "behavioral|technical|situational",
    "tip": "coaching tip for answering this question",
    "sampleFramework": "A sample answer framework using STAR method for behavioral, or structured approach for technical/situational"
  }
]

Rules:
- Include at least 3 behavioral, 3 technical, and 2 situational questions
- Make questions specific to the job title and description
- Tips should be actionable and specific
- Sample frameworks should demonstrate structure, not be complete answers
- Return ONLY valid JSON, no markdown or explanation`;

    const userPrompt = `Job Title: ${jobTitle}\n\nJob Description:\n${jobDescription}`;

    const result = await generateAIResponse(systemPrompt, userPrompt);

    try {
      const questions = JSON.parse(result);
      return NextResponse.json({ questions });
    } catch {
      return NextResponse.json({ questions: [], raw: result });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/ai/interview-prep error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
