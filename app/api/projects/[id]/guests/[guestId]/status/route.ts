import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; guestId: string } }
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

    // Atualiza o status do convidado
    const guest = await prisma.guest.update({
      where: {
        id: params.guestId,
        projectId: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Erro ao atualizar status do convidado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do convidado" },
      { status: 500 }
    );
  }
}
