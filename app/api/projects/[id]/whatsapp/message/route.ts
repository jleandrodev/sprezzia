import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { EvolutionApiService } from "@/app/services/evolution-api";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("[WhatsApp] Unauthorized request");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const service = new EvolutionApiService();
    const data = await request.json();

    // Busca os convidados com base no público-alvo
    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
        NOT: {
          phone: null,
        },
        ...(data.targetAudience === "pending" ? { status: "PENDENTE" } : {}),
      },
      include: {
        companions: true,
      },
    });

    const summary = {
      total: guests.length,
      successful: 0,
      failed: 0,
      skipped: 0,
    };

    for (const guest of guests) {
      try {
        // Remove caracteres não numéricos do telefone
        const phone = guest.phone?.replace(/\D/g, "");

        if (!phone) {
          summary.skipped++;
          continue;
        }

        // Monta a mensagem personalizada
        let message: string;
        if (data.simpleMessage) {
          message = data.simpleMessage;
        } else {
          // Se for template de confirmação, monta a mensagem com a lista de nomes
          const guestList = [
            guest.name,
            ...guest.companions.map((companion) => companion.name),
          ];
          message = `${data.template.introduction}\n\n${guestList.join("\n")}\n\n${data.template.conclusion}`;
        }

        // Envia a mensagem
        await service.sendMessage({
          phoneNumber: phone,
          message,
        });

        // Atualiza o status da mensagem para ENVIADA
        await prisma.guest.update({
          where: { id: guest.id },
          data: { messageStatus: "ENVIADA" },
        });

        summary.successful++;

        // Adiciona um pequeno delay entre as mensagens para evitar bloqueio
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          "[WhatsApp] Erro ao enviar mensagem para",
          guest.name,
          error
        );
        summary.failed++;

        // Atualiza o status da mensagem para ERRO
        await prisma.guest.update({
          where: { id: guest.id },
          data: { messageStatus: "ERRO" },
        });
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[WhatsApp] Error sending messages:", error);

    if (
      error instanceof Error &&
      error.message.includes("Erro de autenticação")
    ) {
      return new NextResponse(error.message, { status: 401 });
    }

    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
