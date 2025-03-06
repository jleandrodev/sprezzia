import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca a configuração do WhatsApp
    const whatsappConfig = await prisma.whatsAppConfig.findUnique({
      where: {
        projectId: params.id,
      },
    });

    if (!whatsappConfig) {
      return NextResponse.json(
        { error: "Configuração do WhatsApp não encontrada" },
        { status: 404 }
      );
    }

    // Busca os convidados do projeto
    const guests = await prisma.guest.findMany({
      where: { projectId: params.id },
      include: { companions: true },
    });

    const results = [];

    // Simula o envio de mensagens (implementação futura)
    for (const guest of guests) {
      if (!guest.phone) continue;

      const guestList = [guest.name, ...guest.companions.map((c) => c.name)];
      const message = `${whatsappConfig.introduction}\n\n${guestList.join("\n")}\n\n${whatsappConfig.conclusion}`;

      results.push({
        guest: guest.name,
        phone: guest.phone,
        status: "pending",
        message: message,
      });
    }

    return NextResponse.json({
      message: "Integração com WhatsApp em desenvolvimento",
      results,
    });
  } catch (error) {
    console.error("Erro ao processar envio de mensagens:", error);
    return NextResponse.json(
      { error: "Erro ao processar envio de mensagens" },
      { status: 500 }
    );
  }
}
