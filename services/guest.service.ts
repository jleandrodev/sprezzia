import { prisma } from "@/lib/prisma";
import { GuestStatus, Prisma } from "@prisma/client";

interface CreateGuestDTO {
  name: string;
  phone?: string;
  status: GuestStatus;
  projectId: string;
  companions?: Array<{
    name: string;
    status: GuestStatus;
  }>;
}

export class GuestService {
  static async create(data: CreateGuestDTO) {
    return prisma.guest.create({
      data: {
        name: data.name,
        phone: data.phone,
        status: data.status,
        projectId: data.projectId,
        companions: {
          create: data.companions,
        },
      },
      include: {
        companions: true,
      },
    });
  }

  static async findByProjectId(projectId: string) {
    return prisma.guest.findMany({
      where: {
        projectId,
      },
      include: {
        companions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
