-- ==========================================
-- Add Profile Image Column To User Table
-- ==========================================

ALTER TABLE `user`
ADD COLUMN `profileImage` LONGTEXT NULL;