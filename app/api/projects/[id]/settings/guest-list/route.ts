import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ProjectService } from "@/services/project.service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const project = await ProjectService.findById(params.id);

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      settings: {
        showPhone: project.guestListSettings?.showPhone ?? true,
        showStatus: project.guestListSettings?.showStatus ?? true,
        showCompanions: project.guestListSettings?.showCompanions ?? true,
        showMessageStatus: project.guestListSettings?.showMessageStatus ?? true,
      },
    });
  } catch (error) {
    console.error("[GET_GUEST_LIST_SETTINGS] Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const project = await ProjectService.findById(params.id);

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();

    const updatedProject = await ProjectService.update(params.id, {
      guestListSettings: {
        create: {
          showPhone: data.showPhone ?? true,
          showStatus: data.showStatus ?? true,
          showCompanions: data.showCompanions ?? true,
          showMessageStatus: data.showMessageStatus ?? true,
        },
      },
    });

    return NextResponse.json({
      settings: updatedProject.guestListSettings,
    });
  } catch (error) {
    console.error("[POST_GUEST_LIST_SETTINGS] Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
