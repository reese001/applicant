import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/anthropic";
import { resumeBuildSchema } from "@/lib/validators";

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
    const { section, rawInput } = resumeBuildSchema.parse(body);

    const systemPrompt = `You are a professional resume writer. Your task is to refine and improve resume content for the "${section}" section.

Rules:
- Use strong action verbs
- Quantify achievements where possible
- Keep language professional and concise
- Use bullet points for experience items
- Return ONLY the refined text, no explanations
- For experience bullets: start each with a strong action verb, include metrics/results
- For summary: write 2-3 sentences highlighting key strengths
- For skills: suggest relevant additional skills based on the content`;

    const userPrompt = `Please refine this ${section} content for a professional resume:\n\n${rawInput}`;

    const result = await generateAIResponse(systemPrompt, userPrompt);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/ai/resume-build error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
