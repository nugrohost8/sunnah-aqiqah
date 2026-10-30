import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Folder penyimpanan upload. Di luar public/ karena file baru di public/ tidak dijamin tersaji setelah build. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";
/** Nama file yang dihasilkan saveImageUpload(); dipakai juga oleh route penyaji untuk menolak path lain. */
export const UPLOAD_NAME_PATTERN = /^(logo|slide|favicon)-[0-9a-f-]{36}\.(webp|png)$/;

/** Path absolut file upload. File upload adalah data runtime, jadi dikecualikan dari tracing bundler. */
export function uploadFilePath(name: string) {
  return path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const PRESETS = {
  // Logo: tinggi maks. 200px sudah tajam untuk tampilan 40px di layar retina.
  logo: { maxBytes: 2 * 1024 * 1024, width: 1000, height: 200, quality: 90, format: "webp", square: false },
  slide: { maxBytes: 5 * 1024 * 1024, width: 1600, height: 1600, quality: 82, format: "webp", square: false },
  // Favicon: PNG persegi (dukungan browser paling luas untuk ikon tab), sisi kosong dibuat transparan.
  favicon: { maxBytes: 1 * 1024 * 1024, width: 512, height: 512, quality: 90, format: "png", square: true },
} as const;

export type UploadKind = keyof typeof PRESETS;

export class UploadError extends Error {}

/** Ambil file dari FormData; null bila input file dibiarkan kosong. */
export function fileFrom(formData: FormData, name: string) {
  const file = formData.get(name);
  return file instanceof File && file.size > 0 ? file : null;
}

/**
 * Validasi, perkecil, dan simpan gambar sebagai WebP. Gambar di-encode ulang oleh sharp,
 * sehingga metadata/payload tersembunyi di file asli tidak ikut tersimpan.
 * @returns URL publik, mis. "/uploads/slide-<uuid>.webp"
 */
export async function saveImageUpload(file: File, kind: UploadKind) {
  const preset = PRESETS[kind];
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new UploadError("Format gambar harus PNG, JPG, atau WebP.");
  }
  if (file.size > preset.maxBytes) {
    throw new UploadError(`Ukuran gambar maksimal ${preset.maxBytes / 1024 / 1024} MB.`);
  }

  let output: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()))
      .rotate() // ikuti orientasi EXIF dari kamera HP
      .resize(
        preset.square
          ? { width: preset.width, height: preset.height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }
          : { width: preset.width, height: preset.height, fit: "inside", withoutEnlargement: true },
      );
    output = await (preset.format === "png" ? image.png() : image.webp({ quality: preset.quality })).toBuffer();
  } catch {
    throw new UploadError("File tidak dapat dibaca sebagai gambar.");
  }

  const name = `${kind}-${randomUUID()}.${preset.format}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(uploadFilePath(name), output);
  return `${UPLOAD_URL_PREFIX}${name}`;
}

/** Hapus file upload lama (abaikan path bawaan /images/... dan file yang sudah tidak ada). */
export async function deleteUpload(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  if (!UPLOAD_NAME_PATTERN.test(name)) return;
  await unlink(uploadFilePath(name)).catch(() => {});
}
