"use client";

import { useState } from "react";
import type { AqiqahPackage } from "@/db/schema";
import { formatNumber, formatRupiah } from "@/lib/format";
import { waLink } from "@/lib/site";

type Animal = "betina" | "jantan";

export function Pricing({
  masak,
  tanpaMasak,
  waNumber,
}: {
  masak: AqiqahPackage[];
  tanpaMasak: AqiqahPackage[];
  waNumber: string;
}) {
  const [animal, setAnimal] = useState<Animal>("betina");

  return (
    <section className="section pricing" id="paket">
      <div className="pricing__bg" />
      <div className="container">
        <div className="section__head section__head--light reveal">
          <p className="eyebrow">Aqiqah Plus Masak</p>
          <h2>
            Paket Aqiqah <em>Siap Saji</em>
          </h2>
          <p>Domba disembelih, dimasak menjadi sate &amp; gule, lalu diantar ke alamat Anda.</p>
        </div>

        <div className="switch reveal" role="group" aria-label="Jenis hewan">
          {(["betina", "jantan"] as const).map((a) => (
            <button key={a} className={animal === a ? "active" : ""} aria-pressed={animal === a} onClick={() => setAnimal(a)}>
              Domba {a === "betina" ? "Betina" : "Jantan"}
            </button>
          ))}
        </div>

        <div className="pricing__grid">
          {masak.map((p) => (
            <article className="price-card reveal" key={p.id}>
              <h3>Paket {p.code}</h3>
              <div className="price-card__price">
                <span>Rp</span>
                <strong>{formatNumber(animal === "betina" ? p.priceBetina : p.priceJantan)}</strong>
              </div>
              <ul>
                <li>
                  <b>{p.sate}</b> tusuk sate
                </li>
                <li>
                  <b>{p.gule}</b> porsi gule
                </li>
              </ul>
              <a
                href={waLink(
                  waNumber,
                  `Assalamu'alaikum, saya ingin memesan Aqiqah Plus Masak Paket ${p.code} (domba ${animal}).`,
                )}
                target="_blank"
                rel="noopener"
                className="btn btn--outline-light"
              >
                Pesan Paket {p.code}
              </a>
            </article>
          ))}
        </div>

        {tanpaMasak.length > 0 && (
          <div className="raw reveal">
            <div className="raw__intro">
              <p className="eyebrow">Aqiqah Tanpa Masak</p>
              <h3>Ingin memasak sendiri?</h3>
              <p>Kami sediakan hewan terbaik yang disembelih sesuai syariat Islam — Anda tinggal mengolahnya di rumah.</p>
            </div>
            <div className="table-wrap">
              <table className="table table--dark">
                <thead>
                  <tr>
                    <th>Tipe</th>
                    <th>Betina</th>
                    <th>Jantan</th>
                    <th>Porsi</th>
                  </tr>
                </thead>
                <tbody>
                  {tanpaMasak.map((p) => (
                    <tr key={p.id}>
                      <td>{p.code}</td>
                      <td>{formatRupiah(p.priceBetina)}</td>
                      <td>{formatRupiah(p.priceJantan)}</td>
                      <td>{p.porsi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="pricing__note reveal">
          *Gratis ongkir hingga 10 km dari kantor. Harga dapat berubah sewaktu-waktu — konfirmasi ke admin sebelum
          memesan.
        </p>
      </div>
    </section>
  );
}
