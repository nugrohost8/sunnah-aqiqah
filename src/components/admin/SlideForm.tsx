"use client";

import { useActionState } from "react";
import { deleteSlide, saveSlide, type SlideState } from "@/app/(admin)/admin/actions";
import type { HeroSlide } from "@/db/schema";
import { DeleteButton, SubmitButton } from "./Buttons";
import { ImagePicker } from "./ImagePicker";

/** Form satu slide. Tanpa `slide` berarti form untuk menambah slide baru. */
export function SlideForm({ slide, nextOrder = 0 }: { slide?: HeroSlide; nextOrder?: number }) {
  const [state, formAction] = useActionState<SlideState, FormData>(saveSlide, { status: "idle" });
  // Setelah action, React mereset form ke defaultValue — saat gagal, pakai isian terakhir agar tidak hilang.
  const failed = state.status === "error" ? state.values : null;
  const v = (key: keyof HeroSlide, fallback = "") => failed?.[key] ?? String(slide?.[key] ?? fallback);
  const active = failed ? failed.active === "on" : (slide?.active ?? true);

  return (
    <form action={formAction} className={`a-card a-slide${slide ? "" : " a-slide--new"}`}>
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <ImagePicker
        name="image"
        current={slide?.image}
        maxMb={5}
        alt={slide ? `Gambar slide ${slide.id}` : "Gambar slide baru"}
        required={!slide}
        className="a-picker--slide"
      />
      <div className="a-slide__fields">
        {!slide && <h2>Tambah slide</h2>}
        <label className="a-field">
          <span>Label kecil</span>
          <input name="eyebrow" defaultValue={v("eyebrow")} placeholder="Kosongkan = tagline · Sejak tahun berdiri" />
        </label>
        <label className="a-field">
          <span>Judul</span>
          <input name="title" defaultValue={v("title")} required placeholder="Syukur yang Sempurna untuk *Buah Hati* Tercinta" />
          <small>Apit kata dengan *bintang* untuk huruf miring berwarna.</small>
        </label>
        <label className="a-field">
          <span>Teks</span>
          <textarea name="subtitle" rows={3} defaultValue={v("subtitle")} required />
        </label>
        <div className="a-slide__row">
          <label className="a-field">
            <span>Teks tombol</span>
            <input name="ctaLabel" defaultValue={v("ctaLabel")} placeholder="Lihat Paket Aqiqah" />
          </label>
          <label className="a-field">
            <span>Link tombol</span>
            <input name="ctaHref" defaultValue={v("ctaHref")} placeholder="#paket" />
          </label>
          <label className="a-field a-field--narrow">
            <span>Urutan</span>
            <input name="sortOrder" type="number" min={0} defaultValue={v("sortOrder", String(nextOrder))} />
          </label>
          <label className="a-field a-field--check">
            <span>Aktif</span>
            <input name="active" type="checkbox" defaultChecked={active} />
          </label>
        </div>
        <div className="a-slide__actions">
          {state.status === "saved" && <p className="a-success">{state.message}</p>}
          {state.status === "error" && <p className="a-alert">{state.message}</p>}
          <SubmitButton pendingText={slide ? "Menyimpan…" : "Menambah…"}>{slide ? "Simpan" : "+ Tambah slide"}</SubmitButton>
          {slide && <DeleteButton action={deleteSlide} confirmText="Hapus slide ini?" />}
        </div>
      </div>
    </form>
  );
}
