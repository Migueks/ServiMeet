/*
  Warnings:

  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `review` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `comment` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Request_status_idx` ON `Request`(`status`);

-- CreateIndex
CREATE INDEX `Service_category_idx` ON `Service`(`category`);

-- CreateIndex
CREATE INDEX `Service_isActive_idx` ON `Service`(`isActive`);

-- RenameIndex
ALTER TABLE `request` RENAME INDEX `Request_clientId_fkey` TO `Request_clientId_idx`;

-- RenameIndex
ALTER TABLE `request` RENAME INDEX `Request_proId_fkey` TO `Request_proId_idx`;

-- RenameIndex
ALTER TABLE `request` RENAME INDEX `Request_serviceId_fkey` TO `Request_serviceId_idx`;

-- RenameIndex
ALTER TABLE `review` RENAME INDEX `Review_clientId_fkey` TO `Review_clientId_idx`;

-- RenameIndex
ALTER TABLE `review` RENAME INDEX `Review_proId_fkey` TO `Review_proId_idx`;

-- RenameIndex
ALTER TABLE `review` RENAME INDEX `Review_serviceId_fkey` TO `Review_serviceId_idx`;

-- RenameIndex
ALTER TABLE `service` RENAME INDEX `Service_proId_fkey` TO `Service_proId_idx`;
