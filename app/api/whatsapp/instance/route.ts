import { NextRequest, NextResponse } from "next/server";
import { EvolutionApiService } from "@/app/services/evolution-api";

export async function POST(request: NextRequest) {
  try {
    const service = new EvolutionApiService();
    const body = await request.json();

    if (!body.number || !/^\d+$/.test(body.number)) {
      return NextResponse.json(
        { error: "Número de WhatsApp inválido" },
        { status: 400 }
      );
    }

    const instance = await service.createInstance({
      number: body.number,
      reject_call: false,
      msg_call: "",
      always_online: true,
      read_messages: true,
    });

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Erro ao criar instância:", error);
    return NextResponse.json(
      { error: "Erro ao criar instância" },
      { status: 500 }
    );
  }
}
