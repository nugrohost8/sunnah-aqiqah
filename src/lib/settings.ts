import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { CONTENT_TAG } from "./content";
import { DEFAULT_SETTINGS, deriveSettings, SETTINGS_KEYS, settingsSchema, type SettingsValues } from "./settings-schema";

/**
 * Pengaturan umum dari database, digabung dengan nilai bawaan.
 * Nilai tersimpan yang tidak lagi valid diabaikan per kunci agar situs tidak pernah rusak.
 */
export async function getSiteSettings() {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG);

  const rows = await db.select().from(siteSettings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const values = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const key of SETTINGS_KEYS) {
    if (!(key in stored)) continue;
    const parsed = settingsSchema.shape[key].safeParse(stored[key]);
    if (parsed.success) values[key] = parsed.data;
  }
  return deriveSettings(values as SettingsValues);
}
