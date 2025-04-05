import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { EvolutionApiService } from "@/app/services/evolution-api";

export const dynamic = "force-dynamic";

export async function GET(
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
    const instance = await service.getInstance();

    // Se não houver instância, retorna estado DISCONNECTED
    if (!instance) {
      return NextResponse.json({ state: "DISCONNECTED" });
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("[WhatsApp] Error getting instance:", error);

    // Se for erro de autenticação da Evolution API, retorna 401
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

    console.log("[WhatsApp] Criando instância com dados:", data);

    const instance = await service.createInstance(data);
    console.log("[WhatsApp] Instância criada com sucesso:", instance);

    return NextResponse.json(instance);
  } catch (error) {
    console.error("[WhatsApp] Error creating instance:", error);

    // Se for erro de autenticação da Evolution API, retorna 401
    if (
      error instanceof Error &&
      error.message.includes("Erro de autenticação")
    ) {
      return new NextResponse(error.message, { status: 401 });
    }

    // Retorna o erro completo para ajudar no diagnóstico
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function PUT(
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
    const instance = await service.updateInstance();

    return NextResponse.json(instance);
  } catch (error) {
    console.error("[WhatsApp] Error updating instance:", error);

    // Se for erro de autenticação da Evolution API, retorna 401
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
