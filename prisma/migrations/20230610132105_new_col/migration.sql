/*
  Warnings:

  - Added the required column `address` to the `Properties` table without a default value. This is not possible if the table is not empty.
  - Made the column `cityId` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `PropertyImages` table without a default value. This is not possible if the table is not empty.
  - Made the column `propertyId` on table `propertyimages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `properties` DROP FOREIGN KEY `Properties_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `propertyimages` DROP FOREIGN KEY `PropertyImages_propertyId_fkey`;

-- AlterTable
ALTER TABLE `properties` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    MODIFY `cityId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `propertyimages` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `propertyId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `facilities` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `capacity` INTEGER NOT NULL,
    `bedType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `propertyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomImages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomPicUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `roomId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomPrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `roomId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Properties` ADD CONSTRAINT `Properties_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `Cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImages` ADD CONSTRAINT `PropertyImages_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rooms` ADD CONSTRAINT `Rooms_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomImages` ADD CONSTRAINT `RoomImages_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomPrice` ADD CONSTRAINT `RoomPrice_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
