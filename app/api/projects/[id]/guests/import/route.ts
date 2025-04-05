import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GuestStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n");

    // Remover o cabeçalho
    const header = lines.shift();
    if (!header) {
      return NextResponse.json(
        { error: "Arquivo CSV inválido" },
        { status: 400 }
      );
    }

    const guests = [];
    let imported = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [
        name,
        phone,
        status,
        acompanhantes,
        status_acompanhantes,
        criancas_0_6,
        criancas_7_10,
      ] = line.split(",").map((item) => item.trim());

      // Se o status não for fornecido ou for inválido, usar PENDENTE
      const guestStatus =
        status && Object.values(GuestStatus).includes(status as GuestStatus)
          ? (status as GuestStatus)
          : "PENDENTE";

      // Preparar acompanhantes
      const companions = [];
      if (acompanhantes) {
        const nomes = acompanhantes.split(";");
        const statusList = status_acompanhantes
          ? status_acompanhantes.split(";")
          : Array(nomes.length).fill("PENDENTE");

        // Se houver menos status que acompanhantes, preencher o restante com PENDENTE
        while (statusList.length < nomes.length) {
          statusList.push("PENDENTE");
        }

        for (let i = 0; i < nomes.length; i++) {
          const companionName = nomes[i].trim();
          if (companionName) {
            const companionStatus = Object.values(GuestStatus).includes(
              statusList[i] as GuestStatus
            )
              ? (statusList[i] as GuestStatus)
              : "PENDENTE";

            companions.push({
              name: companionName,
              status: companionStatus,
            });
          }
        }
      }

      // Criar o convidado
      try {
        await prisma.guest.create({
          data: {
            name,
            phone: phone || null,
            status: guestStatus,
            children_0_6: parseInt(criancas_0_6) || 0,
            children_7_10: parseInt(criancas_7_10) || 0,
            projectId: params.id,
            companions: {
              create: companions,
            },
          },
        });
        imported++;
      } catch (error) {
        console.error(`Erro ao importar convidado ${name}:`, error);
        throw new Error(`Erro ao importar convidado ${name}`);
      }
    }

    return NextResponse.json({ imported });
  } catch (error) {
    console.error("Erro ao processar arquivo:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao processar arquivo",
      },
      { status: 500 }
    );
  }
}
