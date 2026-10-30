import Image from "next/image";
import type { SiteSettings } from "@/lib/settings-schema";
import { waLink } from "@/lib/site";

export function TrustBar() {
  const items = ["Hewan Memenuhi Syarat", "Sesuai Syariat", "Higienis & Lezat", "Aqiqah Plus Sedekah", "Tepat Waktu"];
  return (
    <section className="trust">
      <div className="container trust__inner">
        {items.map((t) => (
          <span key={t}>✦ {t}</span>
        ))}
      </div>
    </section>
  );
}

export function About({ since }: { since: number }) {
  return (
    <section className="section about" id="tentang">
      <div className="container about__grid">
        <div className="about__visual reveal">
          <div className="about__frame">
            <figure className="about__img about__img--1">
              <Image src="/images/nasi-box.jpg" alt="Kemasan nasi box Sunnah Aqiqah" fill sizes="(max-width: 960px) 50vw, 300px" />
              <figcaption>Nasi Box “Hidangan Berkah”</figcaption>
            </figure>
            <figure className="about__img about__img--2">
              <Image src="/images/food-nasi-kebuli.jpg" alt="Paket nasi kebuli Sunnah Aqiqah" fill sizes="(max-width: 960px) 45vw, 260px" />
              <figcaption>Nasi Kebuli Spesial</figcaption>
            </figure>
          </div>
          <div className="about__badge">
            <Image src="/images/logo-mark-gold.png" alt="" width={46} height={28} />
            <span>
              Melayani
              <br />
              <strong>Sejak {since}</strong>
            </span>
          </div>
        </div>
        <div className="about__content reveal">
          <p className="eyebrow">Tentang Kami</p>
          <h2>
            Solusi Aqiqah <em>Terbaik</em> untuk Ayah &amp; Bunda
          </h2>
          <p>
            Sedang merencanakan aqiqah ananda tercinta? Tak perlu repot dan bingung. Sunnah Aqiqah memiliki garda
            terdepan yang profesional, siap memberikan pelayanan maksimal dengan SDM yang ramah dan solusi sesuai
            syari’ah.
          </p>
          <p>
            Setiap hidangan diolah secara higienis dengan cita rasa nikmat, lezat, dan penuh berkah — agar momen syukur
            keluarga terasa sempurna.
          </p>
          <ul className="checklist">
            <li>Domba/kambing yang memenuhi syarat aqiqah</li>
            <li>Disembelih di kandang kami &amp; disisit hingga bersih</li>
            <li>Dimasak oleh SDM berpengalaman dan profesional</li>
            <li>Live support 24 jam / 7 hari via telepon &amp; WhatsApp</li>
          </ul>
          <a href="#keunggulan" className="btn btn--emerald">
            Lihat Keunggulan Kami
          </a>
        </div>
      </div>
    </section>
  );
}

const features = [
  ["Hewan Memenuhi Syarat", "Hewan yang disediakan sudah memenuhi syarat aqiqah dan sesuai syariat."],
  ["Aqiqah Plus Sedekah", "Komitmen Sunnah Aqiqah untuk menyantuni anak yatim dan dhuafa."],
  ["Higienis & Lezat", "Dimasak langsung oleh SDM yang berpengalaman dan profesional."],
  ["Penyembelihan Disaksikan", "Bisa datang langsung ke kandang ataupun menyaksikan via live streaming."],
  ["Gratis Ongkir", "Gratis biaya antar hingga 10 km dari kantor kami.*"],
  ["Gratis Mug & Sertifikat", "Mug dan sertifikat aqiqah untuk konsumen Sunnah Aqiqah.*"],
];

export function Features() {
  return (
    <section className="section features" id="keunggulan">
      <div className="container">
        <div className="section__head reveal">
          <p className="eyebrow">Keunggulan</p>
          <h2>
            Mengapa Memilih <em>Sunnah Aqiqah</em>
          </h2>
          <p>Enam komitmen kami untuk menjaga kesempurnaan ibadah aqiqah ananda.</p>
        </div>
        <div className="features__grid">
          {features.map(([title, desc], i) => (
            <article className="feature reveal" key={title}>
              <span className="feature__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  ["Pilih", "Pilih paket yang sesuai dengan keinginan dan kebutuhan Anda."],
  ["Potong", "Domba dipotong di kandang kami, lalu langsung disisit hingga benar-benar bersih."],
  ["Masak", "Dimasak di tempat yang higienis sesuai dengan pilihan menu Anda."],
  ["Antar", "Diantar ke alamat pemesan dengan tepat waktu."],
];

export function Steps() {
  return (
    <section className="section steps" id="alur">
      <div className="container">
        <div className="section__head reveal">
          <p className="eyebrow">Proses Pemesanan</p>
          <h2>
            Mudah, Berkah, &amp; <em>Tanpa Repot</em>
          </h2>
        </div>
        <ol className="steps__list">
          {steps.map(([title, desc], i) => (
            <li className="reveal" key={title}>
              <span className="steps__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Footer({ settings: s, year }: { settings: SiteSettings; year: number }) {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          {/* Logo bisa hasil upload dengan rasio bebas, jadi pakai <img> dengan tinggi tetap dari CSS. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer__logo" src={s.logoLight} alt={s.siteName} />
          <p className="footer__about">
            Barokallohu fiik. Kami siap memberikan pelayanan terbaik untuk pelaksanaan ibadah aqiqah — dengan SDM yang
            ramah, solusi sesuai syari’ah, dan olahan yang nikmat juga penuh berkah.
          </p>
        </div>
        <div>
          <h4>Paket</h4>
          <a href="#paket">Aqiqah Plus Masak</a>
          <a href="#paket">Aqiqah Tanpa Masak</a>
          <a href="#nasi-box">Nasi Box</a>
          <a href="#bundling">Bundling Box</a>
        </div>
        <div>
          <h4>Informasi</h4>
          <a href="#tentang">Tentang Kami</a>
          <a href="#alur">Proses Pemesanan</a>
          <a href="#testimoni">Testimoni</a>
          <a href="#faq">FAQ</a>
        </div>
        <div>
          <h4>Hubungi</h4>
          {s.admins.map((a) => (
            <a key={a.wa} href={waLink(a.wa)} target="_blank" rel="noopener">
              {a.display}
            </a>
          ))}
          {s.instagram && (
            <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener">
              Instagram
            </a>
          )}
          <a href={s.websiteUrl} target="_blank" rel="noopener">
            {new URL(s.websiteUrl).host}
          </a>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>
          © {s.since}–{year} {s.siteName}. {s.tagline}.
        </span>
        <span className="arabic">بَارَكَ اللهُ لَكَ فِي الْمَوْهُوبِ لَكَ</span>
      </div>
    </footer>
  );
}

export function WhatsAppFloat({ waNumber }: { waNumber: string }) {
  return (
    <a href={waLink(waNumber)} target="_blank" rel="noopener" className="wa-float" aria-label="Chat WhatsApp">
      <svg viewBox="0 0 32 32">
        <path
          fill="currentColor"
          d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8.9 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.5z"
        />
      </svg>
    </a>
  );
}
