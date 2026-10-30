"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="a-card a-error">
      <h2>Terjadi kesalahan</h2>
      <p>{error.message || "Permintaan gagal diproses."}</p>
      <button className="a-btn a-btn--primary" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
