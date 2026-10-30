/**
 * Isi awal database dari data situs lama (sunnahaqiqah.com).
 * Aman dijalankan berulang: tabel yang sudah berisi dilewati, admin hanya dibuat bila belum ada.
 *
 *   pnpm db:seed
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";
import * as s from "../src/db/schema";

config({ path: [".env.local", ".env"], quiet: true });

const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: s, mode: "default" });

async function seedTable<T extends MySqlTable>(table: T, label: string, rows: T["$inferInsert"][]) {
  const existing = await db.select().from(table as MySqlTable).limit(1);
  if (existing.length) {
    console.log(`- ${label}: sudah berisi, dilewati`);
    return;
  }
  await db.insert(table).values(rows);
  console.log(`+ ${label}: ${rows.length} baris`);
}

const masak = [
  ["A", 1_450_000, 1_950_000, 200, 50],
  ["B", 1_700_000, 2_200_000, 240, 60],
  ["C", 1_900_000, 2_400_000, 280, 70],
  ["D", 2_100_000, 2_600_000, 320, 80],
  ["E", 2_350_000, 2_850_000, 360, 90],
  ["F", 2_600_000, 3_150_000, 400, 100],
] as const;

const tanpaMasak = [
  ["A", 1_150_000, 1_650_000, "15–20"],
  ["B", 1_400_000, 1_850_000, "20–25"],
  ["C", 1_600_000, 2_100_000, "25–35"],
  ["D", 1_800_000, 2_350_000, "35–45"],
  ["E", 2_050_000, 3_550_000, "45–50"],
  ["F", 2_300_000, 2_800_000, "50–60"],
] as const;

const bundling = [
  ["perempuan", "jantan", 50, 200, 50, 2_400_000],
  ["perempuan", "jantan", 70, 280, 70, 3_090_000],
  ["perempuan", "jantan", 100, 400, 100, 4_200_000],
  ["perempuan", "betina", 50, 200, 50, 1_800_000],
  ["perempuan", "betina", 70, 280, 70, 2_500_000],
  ["perempuan", "betina", 100, 400, 100, 3_500_000],
  ["laki", "jantan", 50, 400, 100, 4_200_000],
  ["laki", "jantan", 70, 400, 100, 4_440_000],
  ["laki", "jantan", 100, 400, 100, 4_800_000],
  ["laki", "betina", 50, 400, 100, 3_100_000],
  ["laki", "betina", 70, 400, 100, 3_350_000],
  ["laki", "betina", 100, 400, 100, 3_700_000],
] as const;

async function main() {
  await seedTable(s.heroSlides, "Hero slider", [
    {
      image: "/images/food-sate-gule.jpg",
      title: "Syukur yang Sempurna untuk *Buah Hati* Tercinta",
      subtitle:
        "Jasa layanan aqiqah yang mudah, amanah, dan penuh berkah. Domba pilihan disembelih sesuai syariat, diolah higienis dengan cita rasa nikmat, lalu diantar tepat waktu ke rumah Ayah & Bunda.",
      ctaLabel: "Lihat Paket Aqiqah",
      ctaHref: "#paket",
      sortOrder: 0,
    },
    {
      image: "/images/nasi-box.jpg",
      eyebrow: "Paket Nasi Box",
      title: "Hidangan *Berkah* dalam Kemasan Cantik",
      subtitle:
        "Nasi box lengkap dengan tools makan, label nama ananda, dan risalah aqiqah — siap dibagikan kepada keluarga, tetangga, dan kerabat.",
      ctaLabel: "Lihat Nasi Box",
      ctaHref: "#nasi-box",
      sortOrder: 1,
    },
    {
      image: "/images/food-nasi-kebuli.jpg",
      eyebrow: "Menu Spesial",
      title: "Nasi Kebuli *Spesial* untuk Tasyakuran",
      subtitle: "Nasi kebuli spesial dengan sambal goreng kentang, emping, acar, dan buah jeruk dalam satu box praktis.",
      ctaLabel: "Pesan Sekarang",
      ctaHref: "#kontak",
      sortOrder: 2,
    },
  ]);

  await seedTable(s.aqiqahPackages, "Paket aqiqah", [
    ...masak.map(([code, priceBetina, priceJantan, sate, gule], i) => ({
      kind: "masak" as const, code, priceBetina, priceJantan, sate, gule, sortOrder: i,
    })),
    ...tanpaMasak.map(([code, priceBetina, priceJantan, porsi], i) => ({
      kind: "tanpa_masak" as const, code, priceBetina, priceJantan, porsi, sortOrder: i,
    })),
  ]);

  await seedTable(s.nasiBoxes, "Nasi box", [
    { name: "Paket Tasyakur", contents: "Nasi, kerupuk udang, acar", price: 11_500, sortOrder: 0 },
    { name: "Paket A", contents: "Nasi, tumis bihun, kerupuk udang, acar, buah pisang", price: 12_500, sortOrder: 1 },
    { name: "Paket B", contents: "Nasi, telur balado, tumis bihun, kerupuk udang, acar, buah pisang", price: 16_000, sortOrder: 2 },
    { name: "Paket C", contents: "Nasi, ayam goreng, telur balado, tumis bihun, kerupuk udang, acar, pisang", price: 22_000, sortOrder: 3 },
    { name: "Nasi Kebuli", contents: "Nasi kebuli spesial, sambal goreng kentang, emping, acar, buah jeruk", price: 25_000, isSignature: true, sortOrder: 4 },
  ]);

  await seedTable(
    s.bundlingPrices,
    "Bundling box",
    bundling.map(([gender, animal, boxes, sate, gule, price], i) => ({ gender, animal, boxes, sate, gule, price, sortOrder: i })),
  );

  await seedTable(s.testimonials, "Testimoni", [
    { name: "Bunda", subtitle: "Aqiqah putri pertama", quote: "Adminnya sangat ramah, informatif, dan responsif. Tempat penyembelihan sangat bersih — bisa disaksikan langsung — dan pengantaran makanan tepat waktu.", sortOrder: 0 },
    { name: "Pak Fikri", subtitle: "Konsumen Sunnah Aqiqah", quote: "Amanah banget, masakannya super enak, bikin nagih pokoknya. Tidak bau domba-nya. Mantap!", sortOrder: 1 },
    { name: "Bunda", subtitle: "Sudah 3× aqiqah bersama kami", quote: "Pelayanannya fast respon, ramah, dan selalu memberi solusi sesuai syariat. Amanah dan terpercaya — makanya saya selalu pakai Sunnah Aqiqah.", sortOrder: 2 },
  ]);

  await seedTable(s.faqs, "FAQ", [
    { question: "Kapan waktu terbaik melaksanakan aqiqah?", answer: "Sunnahnya pada hari ke-7 kelahiran. Jika berhalangan, dapat dilaksanakan pada hari ke-14, ke-21, atau saat ada kelapangan.", sortOrder: 0 },
    { question: "Apakah saya bisa menyaksikan penyembelihan?", answer: "Bisa. Ayah & Bunda dapat datang langsung ke kandang kami atau menyaksikan prosesnya melalui live streaming.", sortOrder: 1 },
    { question: "Apa perbedaan paket hewan jantan dan betina?", answer: "Keduanya sah untuk aqiqah. Perbedaannya pada jenis dan harga hewan; jumlah sate & gule mengikuti paket yang dipilih.", sortOrder: 2 },
    { question: "Berapa biaya pengantaran?", answer: "Gratis ongkir hingga 10 km dari kantor kami. Untuk jarak lebih jauh, silakan konfirmasi ke admin.", sortOrder: 3 },
    { question: "Bisakah memesan aqiqah tanpa dimasak?", answer: "Bisa. Pilih Paket Aqiqah Tanpa Masak tipe A–F, hewan disembelih sesuai syariat dan diserahkan dalam kondisi bersih.", sortOrder: 4 },
  ]);

  await seedTable(s.partners, "Partner", [
    { name: "Global Agro Pratama", logo: "/images/partners/gap.png", sortOrder: 0 },
    { name: "Global Garda Sarana", logo: "/images/partners/ggs.png", sortOrder: 1 },
    { name: "IT Optima", logo: "/images/partners/itop.png", sortOrder: 2 },
    { name: "Niaga Catering Nusantara", logo: "/images/partners/ncn.png", sortOrder: 3 },
  ]);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("! ADMIN_EMAIL / ADMIN_PASSWORD belum diisi, akun admin tidak dibuat");
  } else if ((await db.select().from(s.adminUsers).where(eq(s.adminUsers.email, email))).length) {
    console.log(`- Admin ${email}: sudah ada, dilewati`);
  } else {
    await db.insert(s.adminUsers).values({ email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) });
    console.log(`+ Admin ${email}: dibuat`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
