CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNo` varchar(32) NOT NULL,
	`customerName` varchar(128) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`userId` int,
	`productModel` varchar(64) NOT NULL,
	`purchaseDate` varchar(32),
	`orderNumber` varchar(128),
	`errorCode` varchar(64),
	`problemDescription` text NOT NULL,
	`status` enum('pending','reviewing','resolved','rejected') NOT NULL DEFAULT 'pending',
	`adminDiagnosis` text,
	`adminSolution` text,
	`replacementDecision` enum('none','partial','full'),
	`adminId` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_tickets_ticketNo_unique` UNIQUE(`ticketNo`)
);
--> statement-breakpoint
CREATE TABLE `ticket_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(256),
	`fileType` varchar(64),
	`fileSize` int,
	`attachmentType` enum('video','photo','other') DEFAULT 'other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`senderRole` enum('admin','customer') NOT NULL,
	`senderName` varchar(128),
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
