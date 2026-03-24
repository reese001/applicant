import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reminderUpdateSchema } from "@/lib/validators";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; reminderId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: params.reminderId },
      include: { application: true },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (reminder.application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = reminderUpdateSchema.parse(body);

    const updated = await prisma.reminder.update({
      where: { id: params.reminderId },
      data: {
        ...(data.remindAt ? { remindAt: new Date(data.remindAt) } : {}),
        ...(data.message !== undefined ? { message: data.message } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("PATCH /api/applications/[id]/reminders/[reminderId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; reminderId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: params.reminderId },
      include: { application: true },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (reminder.application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.reminder.delete({ where: { id: params.reminderId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id]/reminders/[reminderId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
