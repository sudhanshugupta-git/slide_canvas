-- CreateTable
CREATE TABLE `Presentation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `style` JSON NOT NULL,
    `order` INTEGER NOT NULL,
    `presentation_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NULL,
    `src` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `position` JSON NOT NULL,
    `style` JSON NOT NULL,
    `order` INTEGER NOT NULL,
    `slide_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Slide` ADD CONSTRAINT `Slide_presentation_id_fkey` FOREIGN KEY (`presentation_id`) REFERENCES `Presentation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element` ADD CONSTRAINT `Element_slide_id_fkey` FOREIGN KEY (`slide_id`) REFERENCES `Slide`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
