"use client";

import { useEffect, useState } from "react";

/**
 * Input file gambar dengan pratinjau langsung dan pengecekan ukuran di browser,
 * sehingga file terlalu besar ditolak sebelum diunggah.
 */
export function ImagePicker({
  name,
  current,
  maxMb,
  alt,
  dark = false,
  required = false,
  className = "",
}: {
  name: string;
  current?: string;
  maxMb: number;
  alt: string;
  dark?: boolean;
  required?: boolean;
  className?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // Setelah disimpan, gambar tersimpan berganti: buang pratinjau file lokal yang sudah tidak relevan.
  const [shownCurrent, setShownCurrent] = useState(current);
  if (current !== shownCurrent) {
    setShownCurrent(current);
    setPreview(null);
  }

  const src = preview ?? current;

  return (
    <div className={`a-picker ${className}`}>
      <div className={`a-picker__preview${dark ? " a-picker__preview--dark" : ""}`}>
        {/* Pratinjau bisa berupa blob: lokal, jadi pakai <img> biasa. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt={alt} /> : <span>Belum ada gambar</span>}
      </div>
      <input
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp"
        required={required}
        aria-label={alt}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setError(null);
          setPreview(null);
          if (!file) return;
          if (file.size > maxMb * 1024 * 1024) {
            setError(`Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB, maksimal ${maxMb} MB.`);
            e.target.value = "";
            return;
          }
          setPreview(URL.createObjectURL(file));
        }}
      />
      <small className={error ? "a-field__error" : "a-muted"}>{error ?? `PNG, JPG, atau WebP · maks. ${maxMb} MB`}</small>
    </div>
  );
}
