/*
  Warnings:

  - You are about to drop the column `type` on the `Companion` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Guest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuestList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuestListGuest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Companion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GuestStatus" AS ENUM ('PENDENTE', 'CONFIRMADO_PRESENCA', 'CONFIRMADO_AUSENCIA');

-- DropForeignKey
ALTER TABLE "Companion" DROP CONSTRAINT "Companion_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_projectId_fkey";

-- DropForeignKey
ALTER TABLE "GuestList" DROP CONSTRAINT "GuestList_eventId_fkey";

-- DropForeignKey
ALTER TABLE "GuestListGuest" DROP CONSTRAINT "GuestListGuest_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestListGuest" DROP CONSTRAINT "GuestListGuest_guestListId_fkey";

-- AlterTable
ALTER TABLE "Companion" DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "GuestStatus" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Guest";

-- DropTable
DROP TABLE "GuestList";

-- DropTable
DROP TABLE "GuestListGuest";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "CompanionType";

-- DropEnum
DROP TYPE "TransactionCategory";

-- DropEnum
DROP TYPE "TransactionPaymentMethod";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "date" TIMESTAMP(3),
    "type" TEXT,
    "budget" DECIMAL(10,2),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "children_0_6" INTEGER NOT NULL DEFAULT 0,
    "children_7_10" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_configs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");

-- CreateIndex
CREATE INDEX "guests_projectId_idx" ON "guests"("projectId");

-- CreateIndex
CREATE INDEX "documents_projectId_idx" ON "documents"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_configs_projectId_key" ON "whatsapp_configs"("projectId");

-- CreateIndex
CREATE INDEX "Companion_guestId_idx" ON "Companion"("guestId");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Companion" ADD CONSTRAINT "Companion_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_configs" ADD CONSTRAINT "whatsapp_configs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
