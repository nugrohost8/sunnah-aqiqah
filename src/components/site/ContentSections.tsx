import Image from "next/image";
import type { Faq, NasiBox, Partner, Testimonial } from "@/db/schema";
import { formatRupiah } from "@/lib/format";
import { waLink } from "@/lib/site";

export function NasiBoxSection({ items }: { items: NasiBox[] }) {
  return (
    <section className="section nasibox" id="nasi-box">
      <div className="container nasibox__grid">
        <div className="nasibox__visual reveal">
          <div className="nasibox__photo nasibox__photo--main">
            <Image src="/images/nasi-box.jpg" alt="Nasi box Sunnah Aqiqah" fill sizes="(max-width: 960px) 90vw, 460px" />
          </div>
          <div className="nasibox__photo nasibox__photo--sub">
            <Image src="/images/food-nasi-kebuli.jpg" alt="Nasi kebuli Sunnah Aqiqah" fill sizes="(max-width: 960px) 55vw, 280px" />
          </div>
        </div>
        <div className="reveal">
          <p className="eyebrow">Paket Nasi Box</p>
          <h2>
            Hidangan <em>Berkah</em> dalam Kemasan Cantik
          </h2>
          <p className="nasibox__lead">Setiap box dilengkapi tools makan, label nama ananda, dan risalah aqiqah.</p>
          <ul className="menu-list">
            {items.map((b) => (
              <li key={b.id} className={b.isSignature ? "menu-list__signature" : undefined}>
                <div>
                  <h3>
                    {b.name} {b.isSignature && <span className="pill">Spesial</span>}
                  </h3>
                  <p>{b.contents}</p>
                </div>
                <span className="menu-list__dots" />
                <strong>{formatRupiah(b.price)}</strong>
              </li>
            ))}
          </ul>
          <p className="nasibox__note">
            Harga per box, belum termasuk sate &amp; gule aqiqah. Tersedia juga pemesanan nasi box tanpa domba.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="section testimonials" id="testimoni">
      <div className="container">
        <div className="section__head reveal">
          <p className="eyebrow">Testimoni Konsumen</p>
          <h2>
            Cerita Bahagia dari <em>Keluarga Kami</em>
          </h2>
        </div>
        <div className="testimonials__grid">
          {items.map((t, i) => (
            <figure key={t.id} className={`testi reveal${i % 3 === 1 ? " testi--accent" : ""}`}>
              <div className="testi__stars" aria-label={`${t.rating} dari 5 bintang`}>
                {"★".repeat(t.rating)}
              </div>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="avatar">{t.name.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.subtitle}</small>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners({ items }: { items: Partner[] }) {
  if (!items.length) return null;
  return (
    <section className="partners">
      <div className="container partners__inner reveal">
        <p>Partner Kami</p>
        <div className="partners__logos">
          {items.map((p) => (
            // Logo partner bisa berasal dari URL apa saja yang diisi admin, jadi pakai <img> biasa.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.logo} alt={p.name} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ items, waNumber }: { items: Faq[]; waNumber: string }) {
  return (
    <section className="section faq" id="faq">
      <div className="container faq__grid">
        <div className="reveal">
          <p className="eyebrow">FAQ</p>
          <h2>
            Pertanyaan yang <em>Sering Diajukan</em>
          </h2>
          <p>Belum menemukan jawaban? Tim kami siap membantu 24 jam / 7 hari.</p>
          <a href={waLink(waNumber)} target="_blank" rel="noopener" className="btn btn--emerald">
            Tanya Admin
          </a>
        </div>
        <div className="faq__list reveal">
          {items.map((f, i) => (
            <details key={f.id} open={i === 0}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
