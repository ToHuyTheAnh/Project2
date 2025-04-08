/*
  Warnings:

  - You are about to drop the column `commentStatus` on the `comment` table. All the data in the column will be lost.
  - Added the required column `status` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comment` DROP COLUMN `commentStatus`,
    ADD COLUMN `status` ENUM('Published', 'Deleted') NOT NULL;
