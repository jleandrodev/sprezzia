import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EvolutionApiService } from "@/app/services/evolution-api";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const evolutionApi = new EvolutionApiService();
    const instance = await evolutionApi.getInstance(params.id);

    return NextResponse.json(instance);
  } catch (error) {
    console.error("[WHATSAPP_INSTANCE_GET]", error);
    return NextResponse.json(
      { error: "Erro ao buscar instância" },
      { status: 500 }
    );
  }
}
