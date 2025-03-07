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

    // Verifica se o projeto existe e pertence ao usuário
    const project = await ProjectService.getProject(params.id);
    if (!project || project.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Acesso negado" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
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

    // Busca o documento no banco de dados
    const document = await ProjectService.getDocument(documentId);
    if (!document || document.projectId !== params.id) {
      return new NextResponse(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decodifica o conteúdo base64 para um Buffer
    const fileBuffer = Buffer.from(document.content, 'base64');

    // Retorna o arquivo para visualização ou download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.type || "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        // Se for um tipo que o navegador pode exibir, não força o download
        ...(document.type?.startsWith("image/") || 
           document.type?.startsWith("text/") || 
           document.type?.startsWith("application/pdf") 
          ? {} 
          : { "Content-Disposition": `attachment; filename="${document.name}"` }
        ),
      },
    });
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
