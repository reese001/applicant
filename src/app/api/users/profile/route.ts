import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema, passwordChangeSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Password change flow
    if (body.currentPassword || body.newPassword) {
      const data = passwordChangeSchema.parse(body);

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        return NextResponse.json(
          { error: "Cannot change password for OAuth-only accounts" },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hash = await bcrypt.hash(data.newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hash },
      });

      return NextResponse.json({ success: true, message: "Password updated" });
    }

    // Profile update flow
    const data = profileUpdateSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("PATCH /api/users/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
