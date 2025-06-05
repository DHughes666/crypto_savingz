/*
  Warnings:

  - Added the required column `cryptoQty` to the `Saving` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Saving" ADD COLUMN     "cryptoQty" DOUBLE PRECISION NOT NULL;
