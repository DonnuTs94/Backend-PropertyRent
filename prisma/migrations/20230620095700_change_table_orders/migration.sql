/*
  Warnings:

  - You are about to drop the column `statusId` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `expDate` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the `status` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_statusId_fkey`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `statusId`,
    ADD COLUMN `status` ENUM('Waiting for Payment', 'In Progress', 'Waiting for Confirmation', 'Canceled', 'Canceled - Tenant') NOT NULL,
    MODIFY `expDate` DATETIME NOT NULL;

-- DropTable
DROP TABLE `status`;
