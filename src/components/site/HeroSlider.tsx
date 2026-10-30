"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "@/db/schema";
import type { SiteSettings } from "@/lib/settings-schema";
import { waLink } from "@/lib/site";
import { Emphasis, stripEmphasis } from "./Emphasis";

type Slide = Pick<HeroSlide, "id" | "image" | "eyebrow" | "title" | "subtitle" | "ctaLabel" | "ctaHref">;

/** Dipakai bila belum ada slide aktif, agar hero tidak pernah kosong. */
const FALLBACK: Slide = {
  id: 0,
  image: "/images/food-sate-gule.jpg",
  eyebrow: "",
  title: "Syukur yang Sempurna untuk *Buah Hati* Tercinta",
  subtitle: "Domba pilihan disembelih sesuai syariat, diolah higienis, lalu diantar tepat waktu ke rumah Ayah & Bunda.",
  ctaLabel: "Lihat Paket Aqiqah",
  ctaHref: "#paket",
};

export function HeroSlider({ slides: input, settings: s }: { slides: Slide[]; settings: SiteSettings }) {
  const slides = input.length ? input : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || s.heroInterval === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(index + 1), s.heroInterval * 1000);
    return () => window.clearTimeout(t);
  }, [count, paused, index, go, s.heroInterval]);

  const defaultEyebrow = `${s.tagline} · Sejak ${s.since}`;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Sorotan layanan"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero__pattern" />
      <div className="container hero__grid">
        <div className="hero__content reveal">
          <p className="arabic hero__arabic">كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ</p>

          {/* Semua slide ditumpuk di sel grid yang sama, jadi tinggi hero tidak melompat saat berganti. */}
          <div className="hero__slides" aria-live={paused ? "polite" : "off"}>
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={`hero__slide${i === index ? " is-active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} dari ${count}`}
                aria-hidden={i !== index}
                inert={i !== index}
              >
                <p className="eyebrow">{slide.eyebrow || defaultEyebrow}</p>
                {i === 0 ? (
                  <h1>
                    <Emphasis text={slide.title} />
                  </h1>
                ) : (
                  <h2 className="hero__title">
                    <Emphasis text={slide.title} />
                  </h2>
                )}
                <p className="lead">{slide.subtitle}</p>
                <div className="hero__actions">
                  {slide.ctaLabel && slide.ctaHref && (
                    <a href={slide.ctaHref} className="btn btn--gold">
                      {slide.ctaLabel}
                    </a>
                  )}
                  <a href={waLink(s.primaryWa)} target="_blank" rel="noopener" className="btn btn--ghost">
                    Konsultasi via WhatsApp →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {count > 1 && (
            <div className="hero__controls">
              <button type="button" className="hero__arrow" aria-label="Slide sebelumnya" onClick={() => go(index - 1)}>
                ←
              </button>
              <div className="hero__dots">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={i === index ? "is-active" : undefined}
                    aria-label={`Tampilkan slide ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
              <button type="button" className="hero__arrow" aria-label="Slide berikutnya" onClick={() => go(index + 1)}>
                →
              </button>
            </div>
          )}

          <div className="hero__stats">
            <div>
              <strong>{s.since}</strong>
              <span>Melayani Sejak</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Live Support</span>
            </div>
            <div>
              <strong>
                10<small> km</small>
              </strong>
              <span>Gratis Ongkir*</span>
            </div>
          </div>
        </div>

        <div className="hero__visual reveal">
          <div className="arch">
            <div className="arch__inner">
              {slides.map((slide, i) => (
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt={stripEmphasis(slide.title)}
                  fill
                  sizes="(max-width: 960px) 90vw, 430px"
                  priority={i === 0}
                  className={`hero__image${i === index ? " is-active" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="floating-card floating-card--top">
            <span className="icon-circle">✓</span>
            <div>
              <strong>Penyembelihan Disaksikan</strong>
              <small>Datang ke kandang / live streaming</small>
            </div>
          </div>
          <div className="floating-card floating-card--bottom">
            <span className="icon-circle icon-circle--gold">★</span>
            <div>
              <strong>Gratis Mug &amp; Sertifikat</strong>
              <small>Untuk setiap konsumen*</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
