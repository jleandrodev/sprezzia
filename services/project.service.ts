import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { formatCurrency } from "@/app/_lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  date: Date | null;
  type: string | null;
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
    date?: Date | null;
    type?: string;
    userId: string;
    workspaceId: string;
  }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        date: data.date,
        type: data.type,
        userId: data.userId,
        workspaceId: data.workspaceId,
        status: "active",
      },
    });
  }

  static async findMany(workspaceId: string) {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
    });

    return projects.map((project) => ({
      ...project,
      budget: project.budget ? Number(project.budget) : null,
      formattedBudget: project.budget
        ? formatCurrency(Number(project.budget))
        : "R$ 0,00",
    }));
  }

  static async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) return null;

    return {
      ...project,
      budget: project.budget ? Number(project.budget) : null,
      formattedBudget: project.budget
        ? formatCurrency(Number(project.budget))
        : "R$ 0,00",
    };
  }

  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      date?: Date | null;
      type?: string;
      budget?: number;
      image?: string | null;
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
