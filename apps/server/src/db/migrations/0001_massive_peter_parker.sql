CREATE TABLE `daily_ai_news` (
	`id` integer PRIMARY KEY NOT NULL,
	`news` text NOT NULL,
	`date` text NOT NULL,
	`fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_hacker_news` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`stories` text NOT NULL,
	`fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`events` text NOT NULL,
	`date` text NOT NULL,
	`fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_it_news` (
	`id` integer PRIMARY KEY NOT NULL,
	`news` text NOT NULL,
	`date` text NOT NULL,
	`fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_quotes` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`date` text NOT NULL,
	`fetched_at` integer
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_text` text NOT NULL,
	`source_type` text NOT NULL,
	`source_type_desc` text,
	`source_pronounce` text,
	`target_text` text NOT NULL,
	`target_type` text NOT NULL,
	`target_type_desc` text,
	`target_pronounce` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_ai_news_date_unique` ON `daily_ai_news` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_history_date_unique` ON `daily_history` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_it_news_date_unique` ON `daily_it_news` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_quotes_date_unique` ON `daily_quotes` (`date`);