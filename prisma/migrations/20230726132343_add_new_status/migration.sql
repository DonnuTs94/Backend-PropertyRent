/*
  Warnings:

  - You are about to alter the column `expDate` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expTime` on the `otp` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `expDate` DATETIME NOT NULL,
    MODIFY `status` ENUM('Waiting for Payment', 'In Progress', 'Waiting for Confirmation', 'Canceled', 'Canceled - Tenant', 'Completed') NOT NULL;

-- AlterTable
ALTER TABLE `otp` MODIFY `expTime` DATETIME NOT NULL;
