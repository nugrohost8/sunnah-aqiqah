CREATE TABLE `admin_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(120) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `aqiqah_packages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`kind` enum('masak','tanpa_masak') NOT NULL,
	`code` varchar(20) NOT NULL,
	`price_betina` int NOT NULL,
	`price_jantan` int NOT NULL,
	`sate` int,
	`gule` int,
	`porsi` varchar(20),
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `aqiqah_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bundling_prices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`gender` enum('perempuan','laki') NOT NULL,
	`animal` enum('jantan','betina') NOT NULL,
	`boxes` int NOT NULL,
	`sate` int NOT NULL,
	`gule` int NOT NULL,
	`price` int NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `bundling_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`question` varchar(255) NOT NULL,
	`answer` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nasi_boxes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`contents` text NOT NULL,
	`price` int NOT NULL,
	`is_signature` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `nasi_boxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`child_name` varchar(120),
	`event_date` date,
	`package_type` varchar(60) NOT NULL,
	`animal` varchar(30) NOT NULL,
	`notes` text,
	`status` enum('baru','diproses','selesai','batal') NOT NULL DEFAULT 'baru',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`logo` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`subtitle` varchar(191) NOT NULL DEFAULT '',
	`quote` text NOT NULL,
	`rating` tinyint NOT NULL DEFAULT 5,
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
