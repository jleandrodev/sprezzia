import { NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    console.log("User ID:", userId); // Log para debug

    if (!userId) {
      console.log("Usuário não autenticado"); // Log para debug
      return NextResponse.json(
        { error: "Não autorizado. Por favor, faça login." },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log("Dados recebidos:", data); // Log para debug

    // Validando dados obrigatórios
    if (!data.name) {
      return NextResponse.json(
        { error: "Nome do projeto é obrigatório" },
        { status: 400 }
      );
    }

    const project = await ProjectService.create({
      name: data.name,
      description: data.description,
      date: data.date ? new Date(data.date) : null,
      type: data.type,
      userId,
      workspaceId: data.workspaceId,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erro detalhado ao criar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId é obrigatório" },
        { status: 400 }
      );
    }

    const projects = await ProjectService.findMany(workspaceId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
