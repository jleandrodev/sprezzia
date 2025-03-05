import { NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { auth } from "@clerk/nextjs/server";
import { writeFile } from "fs/promises";
import { join } from "path";

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

    let imageUrl = null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${image.name}`;
      const path = join(process.cwd(), "public/uploads", filename);

      await writeFile(path, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const project = await ProjectService.update(params.id, {
      name,
      description,
      date: date ? new Date(date) : null,
      type,
      budget: budget ? parseFloat(budget) : undefined,
      image: imageUrl || undefined,
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
