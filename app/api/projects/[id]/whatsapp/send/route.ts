import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EvolutionApiService } from "@/app/services/evolution-api";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Busca todos os convidados com telefone
    const allGuests = await prisma.guest.findMany({
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

    // Busca apenas os convidados pendentes com telefone
    const pendingGuests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
        NOT: {
          phone: null,
        },
        status: "PENDENTE",
      },
      include: {
        companions: true,
      },
    });

    return NextResponse.json({
      guestsCount: allGuests.length,
      pendingGuestsCount: pendingGuests.length,
    });
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
    const body = await request.json();
    const evolutionApi = new EvolutionApiService();

    // Busca convidados com base no público-alvo selecionado
    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
        NOT: {
          phone: null,
        },
        ...(body.targetAudience === "pending" ? { status: "PENDENTE" } : {}),
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
        let message: string;

        // Se for mensagem simples, usa o texto direto
        if (body.simpleMessage) {
          message = body.simpleMessage;
        } else {
          // Se for template de confirmação, monta a mensagem com a lista de nomes
          const guestList = [
            guest.name,
            ...guest.companions.map((companion) => companion.name),
          ];
          message = `${body.template.introduction}\n\n${guestList.join("\n")}\n\n${body.template.conclusion}`;
        }

        // Remove caracteres não numéricos do telefone
        const phone = guest.phone?.replace(/\D/g, "");

        if (!phone) {
          summary.skipped++;
          continue;
        }

        // Envia a mensagem
        await evolutionApi.sendMessage({
          phoneNumber: phone,
          message,
        });

        // Atualiza o status da mensagem para ENVIADA
        await prisma.$executeRaw`
          UPDATE guests 
          SET "messageStatus" = 'ENVIADA' 
          WHERE id = ${guest.id}
        `;

        summary.successful++;

        // Adiciona um pequeno delay entre as mensagens
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${guest.name}:`, error);

        // Atualiza o status da mensagem para ERRO
        await prisma.$executeRaw`
          UPDATE guests 
          SET "messageStatus" = 'ERRO' 
          WHERE id = ${guest.id}
        `;

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
