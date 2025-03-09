import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/_lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Handles the POST request to update the status of a guest and their companions.
 *
 * @param {NextRequest} request - The incoming request.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The project ID.
 * @param {string} params.guestId - The guest ID.
 * @returns {Promise<NextResponse>} The response to the request.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id: projectId, guestId } = params;
    const { action } = await request.json();

    // Verifica se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: "Projeto não encontrado ou acesso negado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verifica se o convidado existe e pertence ao projeto
    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        projectId,
      },
      include: {
        companions: true,
      },
    });

    if (!guest) {
      return new NextResponse(
        JSON.stringify({ error: "Convidado não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const newStatus = action === "confirm" ? "CONFIRMADO_PRESENCA" : "CONFIRMADO_AUSENCIA";

    // Atualiza o status do convidado principal
    await prisma.guest.update({
      where: {
        id: guestId,
      },
      data: {
        status: newStatus,
      },
    });

    // Atualiza o status de todos os acompanhantes
    if (guest.companions.length > 0) {
      await prisma.companion.updateMany({
        where: {
          guestId,
        },
        data: {
          status: newStatus,
        },
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "Status atualizados com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
