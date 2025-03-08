import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalProjects, activeProjects] = await Promise.all([
      prisma.project.count({
        where: { userId },
      }),
      prisma.project.count({
        where: { 
          userId,
          status: "ACTIVE",
        },
      }),
    ]);

    return NextResponse.json({
      totalProjects,
      activeProjects,
    });
  } catch (error) {
    console.error("[PROJECTS_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
