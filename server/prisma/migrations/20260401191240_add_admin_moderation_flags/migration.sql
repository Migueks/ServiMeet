-- AlterTable
ALTER TABLE `review` ADD COLUMN `isVisible` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false;
