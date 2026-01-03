ALTER TABLE `reminders` ADD `unsubscribed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reminders` ADD `unsubscribedAt` timestamp;