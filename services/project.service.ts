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
  guestListSettings?: {
    showPhone: boolean;
    showStatus: boolean;
    showCompanions: boolean;
    showMessageStatus: boolean;
  } | null;
}

interface DocumentData {
  name: string;
  description?: string;
  type: string;
  size: number;
  content: string; // Conteúdo do arquivo em base64
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

    return projects.map((project) => {
      const { budget, ...rest } = project;
      return {
        ...rest,
        budget: budget ? Number(budget) : null,
        formattedBudget: budget ? formatCurrency(Number(budget)) : "R$ 0,00",
        guestListSettings: null,
      };
    });
  }

  static async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        guestListSettings: true,
      },
    });

    if (!project) return null;

    const { budget, ...rest } = project;
    return {
      ...rest,
      budget: budget ? Number(budget) : null,
      formattedBudget: budget ? formatCurrency(Number(budget)) : "R$ 0,00",
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
      guestListSettings?: {
        create: {
          showPhone: boolean;
          showStatus: boolean;
          showCompanions: boolean;
          showMessageStatus: boolean;
        };
      };
    }
  ) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        guestListSettings: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  static async getProject(id: string) {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  static async getDocument(id: string) {
    return prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        size: true,
        content: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getDocuments(projectId: string) {
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        size: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async createDocument(projectId: string, data: DocumentData) {
    return prisma.document.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        size: data.size,
        content: data.content,
        projectId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        size: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async deleteDocument(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  }
}
