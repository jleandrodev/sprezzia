-- DropForeignKey
ALTER TABLE "whatsapp_configs" DROP CONSTRAINT "whatsapp_configs_projectId_fkey";

-- AddForeignKey
ALTER TABLE "whatsapp_configs" ADD CONSTRAINT "whatsapp_configs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
