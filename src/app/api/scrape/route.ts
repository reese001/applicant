import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeSchema } from "@/lib/validators";
import { scrapeJobUrl } from "@/lib/scraper";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = scrapeSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, scrapeCount: true, scrapeResetDate: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset monthly counter if needed
    const now = new Date();
    const resetDate = new Date(user.scrapeResetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { scrapeCount: 0, scrapeResetDate: now },
      });
      user.scrapeCount = 0;
    }

    // Check limits for free users
    if (user.plan === "FREE" && user.scrapeCount >= 10) {
      return NextResponse.json(
        { error: "Monthly scrape limit reached. Upgrade to Pro for unlimited scraping.", remaining: 0 },
        { status: 429 }
      );
    }

    const result = await scrapeJobUrl(url);

    // Increment counter
    await prisma.user.update({
      where: { id: session.user.id },
      data: { scrapeCount: { increment: 1 } },
    });

    const remaining = user.plan === "FREE" ? 10 - user.scrapeCount - 1 : -1;

    return NextResponse.json({ ...result, remaining });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    console.error("POST /api/scrape error:", error);
    return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 });
  }
}
