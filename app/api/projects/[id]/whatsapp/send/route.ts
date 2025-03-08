import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { EvolutionApiService } from "@/app/services/evolution-api";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Busca a configuração do WhatsApp
    const whatsappConfig = await prisma.whatsAppConfig.findUnique({
      where: {
        projectId: params.id,
      },
    });

    if (!whatsappConfig) {
      return new NextResponse(
        JSON.stringify({ error: "Configuração do WhatsApp não encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Busca os convidados do projeto
    const guests = await prisma.guest.findMany({
      where: { projectId: params.id },
      include: { companions: true },
    });

    const evolutionApi = new EvolutionApiService();
    const results: Record<string, any>[] = [];

    // Envia mensagens para cada convidado
    for (const guest of guests) {
      if (!guest.phone) {
        results.push({
          guest: guest.name,
          status: "skipped",
          error: "Telefone não cadastrado",
        });
        continue;
      }

      const guestList = [guest.name, ...guest.companions.map((c) => c.name)];
      const message = `${whatsappConfig.introduction}\n\n${guestList.join("\n")}\n\n${whatsappConfig.conclusion}`;

      try {
        await evolutionApi.sendMessage({
          phone: guest.phone,
          message,
        });

        results.push({
          guest: guest.name,
          phone: guest.phone,
          status: "success",
        });

        // Aguarda 1.2 segundos entre cada envio para evitar bloqueios
        await new Promise(resolve => setTimeout(resolve, 1200));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Falha ao enviar mensagem";
        console.error(`Erro ao enviar mensagem para ${guest.name}:`, error);
        results.push({
          guest: guest.name,
          phone: guest.phone,
          status: "error",
          error: errorMessage,
        });
      }
    }

    const successful = results.filter(r => r.status === "success").length;
    const failed = results.filter(r => r.status === "error").length;
    const skipped = results.filter(r => r.status === "skipped").length;

    return new NextResponse(
      JSON.stringify({
        results,
        summary: {
          total: results.length,
          successful,
          failed,
          skipped,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao processar envio de mensagens:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
