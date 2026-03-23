import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validators";
import { Prisma, ApplicationStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "appliedDate";
    const order = searchParams.get("order") || "desc";
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Prisma.ApplicationWhereInput = {
      userId: session.user.id,
    };

    if (status) {
      const statuses = status.split(",");
      where.status = { in: statuses as ApplicationStatus[] };
    }

    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { some: { name: tag } };
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {};
    const validSortFields = ["appliedDate", "company", "jobTitle", "status", "salaryMin", "createdAt"];
    if (validSortFields.includes(sort)) {
      (orderBy as Record<string, string>)[sort] = order === "asc" ? "asc" : "desc";
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/applications error:", error);
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
    const data = applicationSchema.parse(body);

    const { tags: tagNames, ...applicationData } = data;

    const application = await prisma.application.create({
      data: {
        ...applicationData,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
        userId: session.user.id,
        tags: tagNames?.length
          ? {
              connectOrCreate: tagNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    await prisma.activityLog.create({
      data: {
        applicationId: application.id,
        action: "created",
        newValue: `Created application for ${application.jobTitle} at ${application.company}`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: error }, { status: 400 });
    }
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
