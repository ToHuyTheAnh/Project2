/*
  Warnings:

  - Added the required column `actor` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `actor` VARCHAR(191) NOT NULL,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
