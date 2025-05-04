/*
  Warnings:

  - You are about to drop the column `likes` on the `post` table. All the data in the column will be lost.
  - You are about to drop the `postshare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `postshare` DROP FOREIGN KEY `PostShare_postId_fkey`;

-- DropForeignKey
ALTER TABLE `postshare` DROP FOREIGN KEY `PostShare_userId_fkey`;

-- AlterTable
ALTER TABLE `post` DROP COLUMN `likes`;

-- DropTable
DROP TABLE `postshare`;

-- CreateTable
CREATE TABLE `UserSharePost` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSharePost_userId_postId_key`(`userId`, `postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSharePost` ADD CONSTRAINT `UserSharePost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSharePost` ADD CONSTRAINT `UserSharePost_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
