-- ==========================================
-- Activity Log Table
-- ==========================================

CREATE TABLE IF NOT EXISTS `activitylog` (
  `id` INT NOT NULL AUTO_INCREMENT,

  `adminId` INT NULL,
  `adminEmail` VARCHAR(191) NULL,

  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NULL,

  `message` TEXT NOT NULL,

  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  INDEX `activitylog_adminId_idx` (`adminId`),
  INDEX `activitylog_entity_idx` (`entity`),
  INDEX `activitylog_createdAt_idx` (`createdAt`)
);