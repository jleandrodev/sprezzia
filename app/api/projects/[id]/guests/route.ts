import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const guests = await prisma.guest.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        companions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Erro ao buscar convidados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar convidados" },
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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validação básica
    if (!body.name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Criar o convidado com todos os campos
    const guestData: Prisma.GuestUncheckedCreateInput = {
      name: body.name,
      phone: body.phone || null,
      status: body.status,
      children_0_6: body.children_0_6 || 0,
      children_7_10: body.children_7_10 || 0,
      observations: body.observations || null,
      projectId: params.id,
      companions: {
        create: body.companions || [],
      },
    };

    const guest = await prisma.guest.create({
      data: guestData,
      include: {
        companions: true,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Erro ao criar convidado:", error);
    return NextResponse.json(
      { error: "Erro ao criar convidado" },
      { status: 500 }
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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: "ID do convidado é obrigatório" },
        { status: 400 }
      );
    }

    // Primeiro, excluir todos os acompanhantes existentes
    await prisma.companion.deleteMany({
      where: {
        guestId: guestId,
      },
    });

    // Atualizar o convidado e criar novos acompanhantes
    const updateData: Prisma.GuestUncheckedUpdateInput = {
      name: body.name,
      phone: body.phone || null,
      status: body.status,
      children_0_6: body.children_0_6 || 0,
      children_7_10: body.children_7_10 || 0,
      observations: body.observations || null,
      companions: {
        create: body.companions || [],
      },
    };

    const updatedGuest = await prisma.guest.update({
      where: {
        id: guestId,
      },
      data: updateData,
      include: {
        companions: true,
      },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Erro ao atualizar convidado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar convidado" },
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

    const body = await request.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: "ID do convidado é obrigatório" },
        { status: 400 }
      );
    }

    // Excluir o convidado (os acompanhantes serão excluídos automaticamente devido ao onDelete: Cascade)
    await prisma.guest.delete({
      where: {
        id: guestId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir convidado:", error);
    return NextResponse.json(
      { error: "Erro ao excluir convidado" },
      { status: 500 }
    );
  }
}
