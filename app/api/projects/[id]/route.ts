import { NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const type = formData.get("type") as string;
    const budget = formData.get("budget") as string;
    const image = formData.get("image") as File | null;

    let imageBase64 = null;

    if (image) {
      // Verifica o tamanho da imagem (limite de 5MB)
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "A imagem deve ter no máximo 5MB" },
          { status: 400 }
        );
      }

      // Converte a imagem para Base64
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      imageBase64 = `data:${image.type};base64,${base64}`;
    }

    const project = await ProjectService.update(params.id, {
      name,
      description,
      date: date ? new Date(date) : null,
      type,
      budget: budget ? parseFloat(budget) : undefined,
      image: imageBase64 || undefined,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await ProjectService.delete(params.id);

    return NextResponse.json({ message: "Projeto excluído com sucesso" });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return NextResponse.json(
      { error: "Erro ao excluir projeto" },
      { status: 500 }
    );
  }
}
