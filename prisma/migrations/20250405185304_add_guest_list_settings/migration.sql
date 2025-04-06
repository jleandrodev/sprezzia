-- CreateTable
CREATE TABLE "guest_list_settings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "showStatus" BOOLEAN NOT NULL DEFAULT true,
    "showCompanions" BOOLEAN NOT NULL DEFAULT true,
    "showMessageStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_list_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_list_settings_projectId_key" ON "guest_list_settings"("projectId");

-- AddForeignKey
ALTER TABLE "guest_list_settings" ADD CONSTRAINT "guest_list_settings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
