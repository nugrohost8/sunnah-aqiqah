CREATE TABLE `wa_messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned,
	`kind` enum('admin','customer','status','test') NOT NULL,
	`recipient` varchar(30) NOT NULL,
	`message` text NOT NULL,
	`ok` boolean NOT NULL,
	`error` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wa_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wa_messages` ADD CONSTRAINT `wa_messages_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `wa_messages_order_idx` ON `wa_messages` (`order_id`);--> statement-breakpoint
CREATE INDEX `wa_messages_recipient_idx` ON `wa_messages` (`recipient`,`created_at`);