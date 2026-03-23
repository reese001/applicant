import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/anthropic";
import { coverLetterSchema } from "@/lib/validators";

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
    const { resumeJson, jobDescription, companyName } = coverLetterSchema.parse(body);

    const systemPrompt = `You are a professional cover letter writer. Write a compelling, personalized cover letter based on the candidate's resume and the job description.

Rules:
- Keep it to 3-4 paragraphs
- Open with a strong hook mentioning the specific role and company
- Highlight 2-3 most relevant achievements from the resume
- Show understanding of the company and role requirements
- Close with enthusiasm and a call to action
- Use professional but warm tone
- Do NOT use generic phrases like "I am writing to express my interest"
- DO NOT include placeholder brackets like [Company Name] - use the actual company name provided`;

    const userPrompt = `Company: ${companyName}\n\nJob Description:\n${jobDescription}\n\nCandidate Resume:\n${JSON.stringify(resumeJson, null, 2)}`;

    const result = await generateAIResponse(systemPrompt, userPrompt);

    return NextResponse.json({ coverLetter: result });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/ai/cover-letter error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
