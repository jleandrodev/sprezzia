-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_projectId_fkey";

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
