"use client";

import { useActionState } from "react";
import { sendWaTest, type WaTestState } from "@/app/(admin)/admin/actions";
import { SubmitButton } from "./Buttons";

export function WaTestForm({ defaultPhone }: { defaultPhone: string }) {
  const [state, formAction] = useActionState<WaTestState, FormData>(sendWaTest, { status: "idle" });
  const phone = state.status === "error" ? state.phone : defaultPhone;

  return (
    <form action={formAction} className="a-inline-setting">
      <label className="a-field">
        <span>Kirim pesan tes ke</span>
        <input name="phone" type="tel" defaultValue={phone} placeholder="0812-xxxx-xxxx" />
      </label>
      <div className="a-inline-setting__actions">
        {state.status === "sent" && <p className="a-success">{state.message}</p>}
        {state.status === "error" && <p className="a-alert">{state.message}</p>}
        <SubmitButton pendingText="Mengirim…">Kirim tes</SubmitButton>
      </div>
    </form>
  );
}
