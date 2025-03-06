import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { introduction, conclusion } = await request.json();

    // Atualiza ou cria a configuração do WhatsApp para o projeto
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

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Erro ao salvar configuração do WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const config = await prisma.whatsAppConfig.findUnique({
      where: {
        projectId: params.id,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Erro ao buscar configuração do WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}
