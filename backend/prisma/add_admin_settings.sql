CREATE TABLE IF NOT EXISTS `adminsetting` (
  `id` INT NOT NULL DEFAULT 1,
  `storeName` VARCHAR(191) NOT NULL DEFAULT 'Style Avenue',
  `storeEmail` VARCHAR(191) NOT NULL DEFAULT 'support@styleavenue.pk',
  `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '+92 312 6779452',
  `currency` VARCHAR(191) NOT NULL DEFAULT 'PKR',
  `shippingFee` DOUBLE NOT NULL DEFAULT 500,
  `freeShippingLimit` DOUBLE NOT NULL DEFAULT 50000,
  `storeAddress` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
);

INSERT INTO `adminsetting`
(
  `id`,
  `storeName`,
  `storeEmail`,
  `phoneNumber`,
  `currency`,
  `shippingFee`,
  `freeShippingLimit`,
  `storeAddress`
)
VALUES
(
  1,
  'Style Avenue',
  'support@styleavenue.pk',
  '+92 312 6779452',
  'PKR',
  500,
  50000,
  'Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan'
)
ON DUPLICATE KEY UPDATE
  `id` = `id`;