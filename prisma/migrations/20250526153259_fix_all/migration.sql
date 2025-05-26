-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_trendTopicId_fkey`;

-- DropIndex
DROP INDEX `Post_trendTopicId_fkey` ON `post`;

-- AlterTable
ALTER TABLE `post` MODIFY `content` TEXT NOT NULL,
    MODIFY `status` ENUM('Published', 'Deleted', 'Banned', 'Pending') NOT NULL DEFAULT 'Published',
    MODIFY `trendTopicId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `bio` VARCHAR(191) NULL,
    MODIFY `hometown` VARCHAR(191) NULL,
    MODIFY `school` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_trendTopicId_fkey` FOREIGN KEY (`trendTopicId`) REFERENCES `TrendTopic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_actor_fkey` FOREIGN KEY (`actor`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
