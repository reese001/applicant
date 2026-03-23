import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (format === "json" && user?.plan !== "PRO") {
      return NextResponse.json(
        { error: "JSON export is a Pro feature" },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: { tags: true, contacts: true },
      orderBy: { appliedDate: "desc" },
    });

    if (format === "json") {
      return NextResponse.json(applications, {
        headers: {
          "Content-Disposition": 'attachment; filename="applications.json"',
        },
      });
    }

    // CSV export
    const headers = [
      "Job Title", "Company", "Location", "Status", "Applied Date",
      "Salary Min", "Salary Max", "Currency", "URL", "Tags", "Notes",
    ];

    const rows = applications.map((app) => [
      `"${(app.jobTitle || "").replace(/"/g, '""')}"`,
      `"${(app.company || "").replace(/"/g, '""')}"`,
      `"${(app.location || "").replace(/"/g, '""')}"`,
      app.status,
      app.appliedDate.toISOString().split("T")[0],
      app.salaryMin || "",
      app.salaryMax || "",
      app.salaryCurrency || "USD",
      `"${(app.url || "").replace(/"/g, '""')}"`,
      `"${app.tags.map((t) => t.name).join(", ")}"`,
      `"${(app.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="applications.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
