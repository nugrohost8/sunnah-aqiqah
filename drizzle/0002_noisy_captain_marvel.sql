CREATE TABLE `hero_slides` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`image` varchar(255) NOT NULL,
	`eyebrow` varchar(120) NOT NULL DEFAULT '',
	`title` varchar(160) NOT NULL,
	`subtitle` text NOT NULL,
	`cta_label` varchar(60) NOT NULL DEFAULT '',
	`cta_href` varchar(255) NOT NULL DEFAULT '',
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `hero_slides_id` PRIMARY KEY(`id`)
);
