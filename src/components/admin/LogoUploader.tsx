"use client";

import { useActionState } from "react";
import { resetLogo, uploadLogo, type UploadState } from "@/app/(admin)/admin/actions";
import { SubmitButton } from "./Buttons";
import { ImagePicker } from "./ImagePicker";
import { useHydrated } from "./useHydrated";

export function LogoUploader({
  logoKey,
  title,
  description,
  src,
  isDefault,
  dark,
}: {
  logoKey: "logoMain" | "logoLight" | "favicon";
  title: string;
  description: string;
  src: string;
  isDefault: boolean;
  dark: boolean;
}) {
  const [state, formAction] = useActionState<UploadState, FormData>(uploadLogo, { status: "idle" });
  const hydrated = useHydrated();

  return (
    <section className="a-card">
      <div className="a-card__head a-card__head--stack">
        <h2>{title}</h2>
        <p className="a-muted">{description}</p>
      </div>
      {/* key: pratinjau file pilihan dibuang setelah logo berganti */}
      <form key={src} action={formAction} className="a-logo-form">
        <input type="hidden" name="key" value={logoKey} />
        <ImagePicker
          name="file"
          current={src}
          maxMb={logoKey === "favicon" ? 1 : 2}
          alt={title}
          dark={dark}
          required
          className={logoKey === "favicon" ? "a-picker--favicon" : "a-picker--logo"}
        />
        <div className="a-logo-form__actions">
          {state.status === "saved" && <p className="a-success">{state.message}</p>}
          {state.status === "error" && <p className="a-alert">{state.message}</p>}
          <SubmitButton pendingText="Mengunggah…">{logoKey === "favicon" ? "Unggah favicon" : "Unggah logo"}</SubmitButton>
          {!isDefault && (
            <button
              type="submit"
              formAction={resetLogo}
              formNoValidate
              disabled={!hydrated}
              className="a-btn a-btn--danger"
              onClick={(e) => {
                if (!confirm("Kembalikan ke gambar bawaan? File yang diunggah akan dihapus.")) e.preventDefault();
              }}
            >
              Kembalikan ke bawaan
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
