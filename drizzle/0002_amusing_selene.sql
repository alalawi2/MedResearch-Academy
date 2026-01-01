ALTER TABLE `lectures` MODIFY COLUMN `fileUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `lectures` MODIFY COLUMN `fileKey` varchar(512);--> statement-breakpoint
ALTER TABLE `lectures` MODIFY COLUMN `fileName` varchar(255);--> statement-breakpoint
ALTER TABLE `lectures` MODIFY COLUMN `fileSize` int;--> statement-breakpoint
ALTER TABLE `lectures` ADD `videoUrl` varchar(512);