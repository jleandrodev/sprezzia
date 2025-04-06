import { PrismaClient } from "@prisma/client";

export class ProjectService {
  static async findById(id: string) {
    const prisma = new PrismaClient();
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          guestListSettings: true,
        },
      });
      return project;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async delete(id: string): Promise<void> {
    const prisma = new PrismaClient();
    try {
      // Com onDelete: Cascade configurado, podemos simplesmente excluir o projeto
      // e o Prisma cuidará de excluir todos os registros relacionados
      await prisma.project.delete({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}
