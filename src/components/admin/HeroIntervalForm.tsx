"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/(admin)/admin/actions";
import { SubmitButton } from "./Buttons";

export function HeroIntervalForm({ interval }: { interval: number }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(saveSettings, { status: "idle" });
  const value = state.status === "idle" ? String(interval) : state.values.heroInterval;
  const error = state.status === "error" ? state.fieldErrors.heroInterval?.[0] : undefined;

  return (
    <form action={formAction} className="a-card a-inline-setting">
      <label className="a-field">
        <span>Geser otomatis setiap (detik)</span>
        <input name="heroInterval" type="number" min={0} max={60} defaultValue={value} aria-invalid={error ? true : undefined} />
        <small className={error ? "a-field__error" : undefined}>{error ?? "Isi 0 untuk mematikan geser otomatis."}</small>
      </label>
      <div className="a-inline-setting__actions">
        {state.status === "saved" && <p className="a-success">Tersimpan.</p>}
        <SubmitButton>Simpan</SubmitButton>
      </div>
    </form>
  );
}
