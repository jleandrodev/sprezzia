import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; guestId: string; companionId: string } }
) {
  try {
    const { status } = await request.json();

    // Valida o status
    if (
      !["CONFIRMADO_PRESENCA", "CONFIRMADO_AUSENCIA", "PENDENTE"].includes(
        status
      )
    ) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // Verifica se o acompanhante pertence ao convidado correto
    const companion = await prisma.companion.findFirst({
      where: {
        id: params.companionId,
        guestId: params.guestId,
        guest: {
          projectId: params.id,
        },
      },
    });

    if (!companion) {
      return NextResponse.json(
        { error: "Acompanhante não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza o status do acompanhante
    const updatedCompanion = await prisma.companion.update({
      where: {
        id: params.companionId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedCompanion);
  } catch (error) {
    console.error("Erro ao atualizar status do acompanhante:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do acompanhante" },
      { status: 500 }
    );
  }
}
