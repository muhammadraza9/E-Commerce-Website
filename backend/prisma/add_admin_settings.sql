CREATE TABLE IF NOT EXISTS `adminsetting` (
  `id` INT NOT NULL DEFAULT 1,

  `storeName` VARCHAR(191) NOT NULL DEFAULT 'Style Avenue',
  `storeEmail` VARCHAR(191) NOT NULL DEFAULT 'support@styleavenue.pk',
  `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '+92 312 6779452',

  `currency` VARCHAR(191) NOT NULL DEFAULT 'PKR',
  `shippingFee` DOUBLE NOT NULL DEFAULT 500,
  `freeShippingLimit` DOUBLE NOT NULL DEFAULT 50000,

  `storeAddress` TEXT NOT NULL,

  `storeLogoUrl` LONGTEXT NULL,
  `whatsappNumber` VARCHAR(191) NULL,
  `instagramUrl` LONGTEXT NULL,
  `facebookUrl` LONGTEXT NULL,

  `supportHours` VARCHAR(191) NOT NULL DEFAULT 'Monday - Saturday: 10:00 AM - 9:00 PM',

  `taxPercentage` DOUBLE NOT NULL DEFAULT 0,

  `codEnabled` BOOLEAN NOT NULL DEFAULT TRUE,

  `freeShippingEnabled` BOOLEAN NOT NULL DEFAULT TRUE,

  `orderPrefix` VARCHAR(191) NOT NULL DEFAULT 'SA',

  `lowStockAlertLimit` INT NOT NULL DEFAULT 5,

  `maintenanceMode` BOOLEAN NOT NULL DEFAULT FALSE,

  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  `updatedAt` DATETIME(3)
  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
  ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
);

INSERT INTO `adminsetting`
(
  id,
  storeName,
  storeEmail,
  phoneNumber,
  currency,
  shippingFee,
  freeShippingLimit,
  storeAddress,
  whatsappNumber,
  supportHours,
  taxPercentage,
  codEnabled,
  freeShippingEnabled,
  orderPrefix,
  lowStockAlertLimit,
  maintenanceMode
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
  'Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan',
  '+92 312 6779452',
  'Monday - Saturday: 10:00 AM - 9:00 PM',
  0,
  TRUE,
  TRUE,
  'SA',
  5,
  FALSE
)
ON DUPLICATE KEY UPDATE
storeName = VALUES(storeName);