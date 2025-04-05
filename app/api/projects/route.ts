import { NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { auth } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    console.log("[GET_PROJECTS] userId:", userId);

    if (!userId) {
      console.log("[GET_PROJECTS] Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    console.log("[GET_PROJECTS] workspaceId:", workspaceId);

    if (!workspaceId) {
      console.log("[GET_PROJECTS] workspaceId não fornecido");
      return NextResponse.json(
        { error: "workspaceId é obrigatório" },
        { status: 400 }
      );
    }

    try {
      const projects = await ProjectService.findMany(workspaceId);
      console.log("[GET_PROJECTS] Projetos encontrados:", projects.length);
      return NextResponse.json(projects);
    } catch (error) {
      console.error("[GET_PROJECTS] Erro do banco de dados:", error);

      if (error instanceof PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: "Erro ao acessar o banco de dados", code: error.code },
          { status: 500 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("[GET_PROJECTS] Erro:", error);

    // Garantir que a resposta seja sempre um JSON válido
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    console.log("[POST_PROJECT] userId:", userId);

    if (!userId) {
      console.log("[POST_PROJECT] Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado. Por favor, faça login." },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log("[POST_PROJECT] Dados recebidos:", data);

    if (!data.name) {
      console.log("[POST_PROJECT] Nome do projeto não fornecido");
      return NextResponse.json(
        { error: "Nome do projeto é obrigatório" },
        { status: 400 }
      );
    }

    try {
      const project = await ProjectService.create({
        name: data.name,
        description: data.description,
        date: data.date ? new Date(data.date) : null,
        type: data.type,
        userId,
        workspaceId: data.workspaceId,
      });

      console.log("[POST_PROJECT] Projeto criado:", project.id);
      return NextResponse.json(project);
    } catch (error) {
      console.error("[POST_PROJECT] Erro do banco de dados:", error);

      if (error instanceof PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: "Erro ao criar projeto", code: error.code },
          { status: 500 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("[POST_PROJECT] Erro:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
