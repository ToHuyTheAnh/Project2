-- CreateTable
CREATE TABLE `UserTrendPoint` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `trendTopicId` VARCHAR(191) NOT NULL,
    `point` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `UserTrendPoint_userId_trendTopicId_key`(`userId`, `trendTopicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserTrendPoint` ADD CONSTRAINT `UserTrendPoint_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
