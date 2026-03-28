ALTER TABLE `customers` MODIFY COLUMN `passwordHash` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `status` enum('active','suspended') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `customers` ADD `passwordChanged` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `activationToken`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `tokenExpiresAt`;