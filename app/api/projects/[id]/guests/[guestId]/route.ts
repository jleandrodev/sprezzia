import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const { name, phone } = await request.json();

    // Atualiza apenas os dados de contato do convidado
    const guest = await prisma.guest.update({
      where: {
        id: params.guestId,
        projectId: params.id,
      },
      data: {
        name,
        phone,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Erro ao atualizar convidado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar convidado" },
      { status: 500 }
    );
  }
}
