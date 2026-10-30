import {
  bigint,
  boolean,
  date,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export const adminUsers = mysqlTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Paket aqiqah per ekor: "masak" (sate & gule) atau "tanpa_masak" (hewan saja). */
export const aqiqahPackages = mysqlTable("aqiqah_packages", {
  id: serial("id").primaryKey(),
  kind: mysqlEnum("kind", ["masak", "tanpa_masak"]).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  priceBetina: int("price_betina").notNull(),
  priceJantan: int("price_jantan").notNull(),
  sate: int("sate"),
  gule: int("gule"),
  porsi: varchar("porsi", { length: 20 }),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const nasiBoxes = mysqlTable("nasi_boxes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  contents: text("contents").notNull(),
  price: int("price").notNull(),
  isSignature: boolean("is_signature").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const bundlingPrices = mysqlTable("bundling_prices", {
  id: serial("id").primaryKey(),
  gender: mysqlEnum("gender", ["perempuan", "laki"]).notNull(),
  animal: mysqlEnum("animal", ["jantan", "betina"]).notNull(),
  boxes: int("boxes").notNull(),
  sate: int("sate").notNull(),
  gule: int("gule").notNull(),
  price: int("price").notNull(),
  sortOrder: int("sort_order").notNull().default(0),
});

export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  subtitle: varchar("subtitle", { length: 191 }).notNull().default(""),
  quote: text("quote").notNull(),
  rating: tinyint("rating").notNull().default(5),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const faqs = mysqlTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 255 }).notNull(),
  answer: text("answer").notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const partners = mysqlTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  logo: varchar("logo", { length: 255 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/** Slide pada Hero Section halaman utama. `image` berupa path /images/... atau /uploads/... */
export const heroSlides = mysqlTable("hero_slides", {
  id: serial("id").primaryKey(),
  image: varchar("image", { length: 255 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 120 }).notNull().default(""),
  title: varchar("title", { length: 160 }).notNull(),
  subtitle: text("subtitle").notNull(),
  ctaLabel: varchar("cta_label", { length: 60 }).notNull().default(""),
  ctaHref: varchar("cta_href", { length: 255 }).notNull().default(""),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/** Pengaturan umum situs (key–value). Kunci & nilai bawaan didefinisikan di src/lib/settings.ts. */
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const ORDER_STATUSES = ["baru", "diproses", "selesai", "batal"] as const;

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  childName: varchar("child_name", { length: 120 }),
  eventDate: date("event_date", { mode: "string" }),
  packageType: varchar("package_type", { length: 60 }).notNull(),
  animal: varchar("animal", { length: 30 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ORDER_STATUSES).notNull().default("baru"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const WA_MESSAGE_KINDS = ["admin", "customer", "status", "test"] as const;

/** Log pesan yang dikirim lewat WA Gateway: notifikasi admin, konfirmasi & update status ke pelanggan, pesan tes. */
export const waMessages = mysqlTable(
  "wa_messages",
  {
    id: serial("id").primaryKey(),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id, { onDelete: "cascade" }),
    kind: mysqlEnum("kind", WA_MESSAGE_KINDS).notNull(),
    recipient: varchar("recipient", { length: 30 }).notNull(),
    message: text("message").notNull(),
    ok: boolean("ok").notNull(),
    error: varchar("error", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("wa_messages_order_idx").on(t.orderId), index("wa_messages_recipient_idx").on(t.recipient, t.createdAt)],
);

export type AqiqahPackage =typeof aqiqahPackages.$inferSelect;
export type NasiBox = typeof nasiBoxes.$inferSelect;
export type BundlingPrice = typeof bundlingPrices.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type WaMessage = typeof waMessages.$inferSelect;
export type WaMessageKind = (typeof WA_MESSAGE_KINDS)[number];
