/*
  Warnings:

  - You are about to drop the column `messageStatus` on the `message` table. All the data in the column will be lost.
  - Added the required column `status` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `messageStatus`,
    ADD COLUMN `status` ENUM('Published', 'Deleted') NOT NULL;
