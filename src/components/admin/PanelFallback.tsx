/** Placeholder saat data halaman admin (sesi + database) sedang dimuat. */
export function PanelFallback() {
  return (
    <section className="a-card a-skeleton" aria-busy="true" aria-label="Memuat data">
      <span />
      <span />
      <span />
    </section>
  );
}
