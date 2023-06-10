-- DropForeignKey
ALTER TABLE `roomprice` DROP FOREIGN KEY `RoomPrice_roomId_fkey`;

-- AddForeignKey
ALTER TABLE `RoomPrice` ADD CONSTRAINT `RoomPrice_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
