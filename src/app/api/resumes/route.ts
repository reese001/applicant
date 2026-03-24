import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumeSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = resumeSchema.parse(body);

    const resume = await prisma.resume.create({
      data: {
        title: data.title,
        contentJson: data.contentJson as Parameters<typeof prisma.resume.create>[0]["data"]["contentJson"],
        templateId: data.templateId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/resumes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
