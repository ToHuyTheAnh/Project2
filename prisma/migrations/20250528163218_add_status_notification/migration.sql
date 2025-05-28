/*
  Warnings:

  - The values [Published,Deleted] on the enum `Message_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `status` ENUM('Seen', 'Unseen') NOT NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `status` ENUM('UNREAD', 'READ') NOT NULL DEFAULT 'UNREAD';
