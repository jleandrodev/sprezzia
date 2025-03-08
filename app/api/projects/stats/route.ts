import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
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
