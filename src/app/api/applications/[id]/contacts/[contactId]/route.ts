import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contactUpdateSchema } from "@/lib/validators";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.contactId },
      include: { application: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (contact.application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = contactUpdateSchema.parse(body);

    const updated = await prisma.contact.update({
      where: { id: params.contactId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("PATCH /api/applications/[id]/contacts/[contactId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.contactId },
      include: { application: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (contact.application.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.contact.delete({ where: { id: params.contactId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id]/contacts/[contactId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
