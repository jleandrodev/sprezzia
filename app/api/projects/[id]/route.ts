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

    const data = await req.json();
    const project = await ProjectService.update(params.id, data);

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
