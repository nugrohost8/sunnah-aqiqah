"use client";

import { useActionState, useEffect } from "react";
import { createOrder, type OrderState } from "@/app/(site)/actions";
import { ANIMALS, PACKAGE_TYPES } from "@/lib/orders";

const initialState: OrderState = { status: "idle" };

export function OrderForm() {
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const v = state.status === "error" ? state.values : {};

  useEffect(() => {
    // Coba buka WhatsApp otomatis; bila diblokir browser, tombol di bawah tetap tersedia.
    if (state.status === "success") window.open(state.waUrl, "_blank", "noopener");
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="contact__form contact__form--done">
        <span className="icon-circle">✓</span>
        <h3>Jazakumullahu khairan!</h3>
        <p>
          Pesanan Anda sudah kami terima. Admin kami akan segera menghubungi Anda melalui WhatsApp. Ingin langsung chat admin?
          Tekan tombol di bawah.
        </p>
        <a href={state.waUrl} target="_blank" rel="noopener" className="btn btn--gold btn--block">
          Lanjutkan ke WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className="contact__form" action={formAction} noValidate>
      {state.status === "error" && <p className="form-alert">{state.message}</p>}
      <div className="field">
        <label htmlFor="f-name">Nama Ayah / Bunda</label>
        <input id="f-name" name="name" type="text" placeholder="Nama lengkap" required defaultValue={v.name} />
        <FieldError messages={errors?.name} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="f-phone">No. WhatsApp</label>
          <input id="f-phone" name="phone" type="tel" placeholder="08xx-xxxx-xxxx" required defaultValue={v.phone} />
          <FieldError messages={errors?.phone} />
        </div>
        <div className="field">
          <label htmlFor="f-date">Tanggal Acara</label>
          <input id="f-date" name="eventDate" type="date" defaultValue={v.eventDate} />
          <FieldError messages={errors?.eventDate} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-child">Nama Ananda</label>
        <input id="f-child" name="childName" type="text" placeholder="Untuk label & sertifikat" defaultValue={v.childName} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="f-type">Jenis Paket</label>
          <select id="f-type" name="packageType" defaultValue={v.packageType}>
            {PACKAGE_TYPES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-animal">Hewan</label>
          <select id="f-animal" name="animal" defaultValue={v.animal}>
            {ANIMALS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-notes">Alamat &amp; Catatan</label>
        <textarea id="f-notes" name="notes" rows={3} placeholder="Alamat pengantaran, pilihan paket A–F, jumlah box, dll." defaultValue={v.notes} />
      </div>
      <input type="text" name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn btn--gold btn--block" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim Pesanan via WhatsApp"}
      </button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? <small className="field-error">{messages[0]}</small> : null;
}
