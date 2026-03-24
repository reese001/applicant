import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { reminderCreateSchema } from "@/lib/validators";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check plan limits for free users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan === "FREE") {
      const activeReminders = await prisma.reminder.count({
        where: {
          sent: false,
          application: { userId: session.user.id },
        },
      });

      if (activeReminders >= PLANS.FREE.reminderLimit) {
        return NextResponse.json(
          { error: `Free plan is limited to ${PLANS.FREE.reminderLimit} active reminders. Upgrade to Pro for unlimited.` },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const data = reminderCreateSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        applicationId: params.id,
        remindAt: new Date(data.remindAt),
        message: data.message,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("POST /api/applications/[id]/reminders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
