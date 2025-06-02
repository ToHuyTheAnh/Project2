/*
  Warnings:

  - Made the column `gender` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relationship` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `shopitem` MODIFY `type` ENUM('FRAME', 'IMAGE', 'BGR') NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bgrUrl` VARCHAR(191) NULL,
    ADD COLUMN `frameUrl` VARCHAR(191) NULL,
    MODIFY `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
    MODIFY `relationship` ENUM('Single', 'InRelationship', 'Married', 'Other') NOT NULL DEFAULT 'Single';
