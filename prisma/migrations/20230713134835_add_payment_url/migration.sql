/*
  Warnings:

  - You are about to alter the column `expDate` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `paymentUrl` VARCHAR(191) NULL,
    MODIFY `expDate` DATETIME NOT NULL;
