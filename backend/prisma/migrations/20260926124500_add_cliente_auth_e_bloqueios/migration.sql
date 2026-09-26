-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "email" TEXT,
ADD COLUMN "senhaHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateTable
CREATE TABLE "BloqueioAgenda" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloqueioAgenda_pkey" PRIMARY KEY ("id")
);
