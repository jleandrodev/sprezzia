import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        companions: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error("[GUESTS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
