-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NAO_ENVIADA', 'ENVIADA', 'ERRO');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "messageStatus" "MessageStatus" NOT NULL DEFAULT 'NAO_ENVIADA';
