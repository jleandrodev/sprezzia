import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EvolutionApiService } from "@/app/services/evolution-api";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Busca apenas convidados que têm número de telefone
    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
        NOT: {
          phone: null,
        },
      },
      include: {
        companions: true,
      },
    });

    return NextResponse.json({ guestsCount: guests.length });
  } catch (error) {
    console.error("Erro ao buscar convidados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar convidados" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { template } = await request.json();
    const evolutionApi = new EvolutionApiService();

    // Busca convidados com telefone e seus acompanhantes
    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
        NOT: {
          phone: null,
        },
      },
      include: {
        companions: true,
      },
    });

    const summary = {
      successful: 0,
      failed: 0,
      skipped: 0,
    };

    for (const guest of guests) {
      try {
        // Monta a lista de nomes (convidado principal + acompanhantes)
        const guestList = [
          guest.name,
          ...guest.companions.map((companion) => companion.name),
        ];

        // Monta a mensagem completa
        const message = `${template.introduction}\n\n${guestList.join("\n")}\n\n${template.conclusion}`;

        // Remove caracteres não numéricos do telefone
        const phone = guest.phone?.replace(/\D/g, "");

        if (!phone) {
          summary.skipped++;
          continue;
        }

        // Envia a mensagem
        await evolutionApi.sendMessage({
          phone,
          message,
        });

        summary.successful++;

        // Adiciona um pequeno delay entre as mensagens
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${guest.name}:`, error);
        summary.failed++;
      }
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Erro ao enviar mensagens:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagens" },
      { status: 500 }
    );
  }
}
