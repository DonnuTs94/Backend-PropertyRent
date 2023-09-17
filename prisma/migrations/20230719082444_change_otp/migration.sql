/*
  Warnings:

  - You are about to alter the column `expDate` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expTime` on the `otp` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Made the column `otp` on table `otp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `expDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `otp` MODIFY `otp` VARCHAR(191) NOT NULL,
    MODIFY `expTime` DATETIME NOT NULL;
