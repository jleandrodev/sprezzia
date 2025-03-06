import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const INSTANCE_NAME = process.env.WHATSAPP_INSTANCE_NAME;

if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !INSTANCE_NAME) {
  throw new Error("Configuração do WhatsApp não encontrada");
}

function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");

  // Se o número não começar com 55, adiciona
  return numbers.startsWith("55") ? numbers : `55${numbers}`;
}

async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("apikey", EVOLUTION_API_KEY);

    const formattedPhone = formatPhoneNumber(phone);

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Busca a configuração do WhatsApp
    const config = await prisma.$queryRaw`
      SELECT * FROM whatsapp_configs WHERE project_id = ${params.id}
    `;

    if (!config || !Array.isArray(config) || config.length === 0) {
      return NextResponse.json(
        { error: "Configuração do WhatsApp não encontrada" },
        { status: 404 }
      );
    }

    const whatsappConfig = config[0];

    // Busca os convidados do projeto
    const guests = await prisma.guest.findMany({
      where: { projectId: params.id },
      include: { companions: true },
    });

    const results = [];

    // Envia mensagem para cada convidado que tem telefone
    for (const guest of guests) {
      if (!guest.phone) continue;

      const guestList = [guest.name, ...guest.companions.map((c) => c.name)];
      const message = `${whatsappConfig.introduction}\n\n${guestList.join("\n")}\n\n${
        whatsappConfig.conclusion
      }`;

      try {
        const result = await sendWhatsAppMessage(guest.phone, message);
        results.push({
          guest: guest.name,
          phone: formatPhoneNumber(guest.phone),
          status: "success",
          result,
        });
      } catch (error) {
        results.push({
          guest: guest.name,
          phone: formatPhoneNumber(guest.phone),
          status: "error",
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erro ao processar envio de mensagens:", error);
    return NextResponse.json(
      { error: "Erro ao processar envio de mensagens" },
      { status: 500 }
    );
  }
}
