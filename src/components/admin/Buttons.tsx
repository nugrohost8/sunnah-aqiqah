"use client";

import { useFormStatus } from "react-dom";
import { useHydrated } from "./useHydrated";

export function SubmitButton({
  children,
  pendingText = "Menyimpan…",
  small = false,
}: {
  children: React.ReactNode;
  pendingText?: string;
  small?: boolean;
}) {
  const { pending } = useFormStatus();
  const hydrated = useHydrated();
  return (
    <button type="submit" className={`a-btn a-btn--primary${small ? " a-btn--small" : ""}`} disabled={pending || !hydrated}>
      {pending ? pendingText : children}
    </button>
  );
}

export function DeleteButton({
  action,
  confirmText = "Hapus data ini?",
}: {
  action: (formData: FormData) => Promise<void>;
  confirmText?: string;
}) {
  const { pending } = useFormStatus();
  const hydrated = useHydrated();
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      className="a-btn a-btn--danger"
      disabled={pending || !hydrated}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      Hapus
    </button>
  );
}
