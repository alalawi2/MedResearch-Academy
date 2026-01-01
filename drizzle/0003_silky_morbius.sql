CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lectureId` int NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`userEmail` varchar(320),
	`question` text NOT NULL,
	`answer` text,
	`answeredBy` int,
	`answeredAt` timestamp,
	`isPublished` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_lectureId_lectures_id_fk` FOREIGN KEY (`lectureId`) REFERENCES `lectures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_answeredBy_users_id_fk` FOREIGN KEY (`answeredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;