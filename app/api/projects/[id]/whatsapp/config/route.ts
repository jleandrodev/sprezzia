import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const config = await prisma.whatsAppConfig.findUnique({
      where: {
        projectId: params.id,
      },
      select: {
        introduction: true,
        conclusion: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { introduction: "", conclusion: "" },
        { status: 200 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { introduction, conclusion } = body;

    const config = await prisma.whatsAppConfig.upsert({
      where: {
        projectId: params.id,
      },
      update: {
        introduction,
        conclusion,
      },
      create: {
        projectId: params.id,
        introduction,
        conclusion,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}
