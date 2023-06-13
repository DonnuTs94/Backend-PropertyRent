/*
  Warnings:

  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `cities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `properties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `propertyimages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `provincies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roomimages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roomprice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `rooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `rooms` table. All the data in the column will be lost.
  - You are about to alter the column `bedType` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- DropForeignKey
ALTER TABLE `cities` DROP FOREIGN KEY `Cities_provinceId_fkey`;

-- DropForeignKey
ALTER TABLE `properties` DROP FOREIGN KEY `Properties_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `properties` DROP FOREIGN KEY `Properties_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `properties` DROP FOREIGN KEY `Properties_provinceId_fkey`;

-- DropForeignKey
ALTER TABLE `propertyimages` DROP FOREIGN KEY `PropertyImages_propertyId_fkey`;

-- DropForeignKey
ALTER TABLE `roomimages` DROP FOREIGN KEY `RoomImages_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `roomprice` DROP FOREIGN KEY `RoomPrice_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `rooms` DROP FOREIGN KEY `Rooms_propertyId_fkey`;

-- AlterTable
ALTER TABLE `categories` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `cities` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `provinceId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `properties` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `categoryId` VARCHAR(191) NOT NULL,
    MODIFY `provinceId` VARCHAR(191) NOT NULL,
    MODIFY `cityId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `propertyimages` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `propertyId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `provincies` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `roomimages` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `roomId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `roomprice` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `roomId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `rooms` DROP PRIMARY KEY,
    DROP COLUMN `description`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `bedType` ENUM('King Size', 'Single Bed', 'Twin Bed', 'Double Bed', 'Super King Size') NOT NULL,
    MODIFY `propertyId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Properties` ADD CONSTRAINT `Properties_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Properties` ADD CONSTRAINT `Properties_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `Provincies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Properties` ADD CONSTRAINT `Properties_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `Cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImages` ADD CONSTRAINT `PropertyImages_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rooms` ADD CONSTRAINT `Rooms_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomImages` ADD CONSTRAINT `RoomImages_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomPrice` ADD CONSTRAINT `RoomPrice_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cities` ADD CONSTRAINT `Cities_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `Provincies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
