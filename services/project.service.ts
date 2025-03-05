import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  date: Date | null;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  workspaceId: string;
}

export class ProjectService {
  static async create(data: {
    name: string;
    description?: string;
    date?: Date;
    budget?: number;
    userId: string;
    workspaceId: string;
  }) {
    return prisma.project.create({
      data,
    });
  }

  static async findMany(workspaceId: string) {
    return prisma.project.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
    });
  }

  static async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      date?: Date;
      budget?: number;
    }
  ) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}
