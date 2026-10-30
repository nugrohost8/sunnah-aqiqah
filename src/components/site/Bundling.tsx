"use client";

import { useState } from "react";
import type { BundlingPrice } from "@/db/schema";
import { formatRupiah } from "@/lib/format";

type Gender = BundlingPrice["gender"];

const animals = [
  { key: "jantan", title: "Hewan Jantan", badge: "Premium" },
  { key: "betina", title: "Hewan Betina", badge: "Ekonomis" },
] as const;

export function Bundling({ rows }: { rows: BundlingPrice[] }) {
  const [gender, setGender] = useState<Gender>("perempuan");

  return (
    <section className="section bundling" id="bundling">
      <div className="container">
        <div className="section__head reveal">
          <p className="eyebrow">Paket Bundling Box</p>
          <h2>
            Aqiqah + Nasi Box, <em>Lebih Hemat</em>
          </h2>
          <p>Domba aqiqah lengkap dengan sate, gule, dan nasi box tipe A dalam satu paket.</p>
        </div>

        <div className="switch switch--light reveal" role="group" aria-label="Jenis kelamin ananda">
          <button className={gender === "perempuan" ? "active" : ""} aria-pressed={gender === "perempuan"} onClick={() => setGender("perempuan")}>
            Anak Perempuan · 1 Ekor
          </button>
          <button className={gender === "laki" ? "active" : ""} aria-pressed={gender === "laki"} onClick={() => setGender("laki")}>
            Anak Laki-laki · 2 Ekor
          </button>
        </div>

        <div className="bundling__grid">
          {animals.map((a) => (
            <div className="bundle reveal" key={a.key}>
              <div className="bundle__head">
                <h3>{a.title}</h3>
                <span>{a.badge}</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Box</th>
                    <th>Sate</th>
                    <th>Gule</th>
                    <th>Harga Hemat</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .filter((r) => r.gender === gender && r.animal === a.key)
                    .map((r) => (
                      <tr key={r.id}>
                        <td>{r.boxes} box</td>
                        <td>{r.sate}</td>
                        <td>{r.gule}</td>
                        <td>{formatRupiah(r.price)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
