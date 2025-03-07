import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ProjectService } from "@/services/project.service";

export const dynamic = "force-dynamic";

type RouteParams = Record<string, string> & {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (documentId) {
      // Buscar documento específico
      const document = await ProjectService.getDocument(documentId);
      if (!document) {
        return new NextResponse(
          JSON.stringify({ error: "Documento não encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verificar se o usuário tem acesso ao projeto
      const project = await ProjectService.getProject(document.projectId);
      if (!project || project.userId !== userId) {
        return new NextResponse(
          JSON.stringify({ error: "Acesso negado" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Retornar o documento como download
      const buffer = Buffer.from(document.content, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': document.type,
          'Content-Disposition': `attachment; filename="${document.name}"`,
          'Content-Length': buffer.length.toString()
        }
      });
    }

    // Listar todos os documentos do projeto
    const project = await ProjectService.getProject(params.id);
    if (!project || project.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Acesso negado" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const documents = await ProjectService.getDocuments(params.id);
    return new NextResponse(JSON.stringify(documents), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar documentos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const project = await ProjectService.getProject(params.id);
    if (!project || project.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Acesso negado" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const document = await ProjectService.createDocument(params.id, body);

    return new NextResponse(JSON.stringify(document), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao criar documento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    if (!documentId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do documento não fornecido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const document = await ProjectService.getDocument(documentId);
    if (!document) {
      return new NextResponse(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const project = await ProjectService.getProject(document.projectId);
    if (!project || project.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Acesso negado" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    await ProjectService.deleteDocument(documentId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao excluir documento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
