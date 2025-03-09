import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    if (!project) {
      return new NextResponse("Projeto não encontrado", { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
