/*
  Warnings:

  - Made the column `categoryId` on table `service` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cityId` on table `service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_cityId_fkey`;

-- AlterTable
ALTER TABLE `service` MODIFY `categoryId` INTEGER NOT NULL,
    MODIFY `cityId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
