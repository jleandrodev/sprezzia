import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EvolutionApiService } from "@/app/services/evolution-api";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const evolutionApi = new EvolutionApiService();
    const result = await evolutionApi.updateInstance(params.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[WHATSAPP_INSTANCE_UPDATE]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar instância" },
      { status: 500 }
    );
  }
}
