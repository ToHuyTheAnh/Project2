/*
  Warnings:

  - Made the column `displayName` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `displayName` VARCHAR(191) NOT NULL,
    MODIFY `avatar` VARCHAR(191) NULL;
