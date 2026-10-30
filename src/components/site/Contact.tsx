import type { SiteSettings } from "@/lib/settings-schema";
import { waLink } from "@/lib/site";
import { OrderForm } from "./OrderForm";

export function Contact({ settings: s }: { settings: SiteSettings }) {
  return (
    <section className="section contact" id="kontak">
      <div className="container">
        <div className="payments reveal">
          {s.bankAccount && (
            <div className="payment">
              <span className="payment__icon">🏦</span>
              <div>
                <h3>Transfer Rekening</h3>
                <p>
                  {s.bankName} {s.bankAccount}
                  {s.bankHolder && (
                    <>
                      <br />
                      a.n. {s.bankHolder}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
          <div className="payment">
            <span className="payment__icon">🛵</span>
            <div>
              <h3>Cash and Carry</h3>
              <p>Pembayaran dapat dijemput petugas kami di rumah customer.</p>
            </div>
          </div>
          <div className="payment">
            <span className="payment__icon">🏢</span>
            <div>
              <h3>Bayar di Kantor</h3>
              <p>Datang langsung ke cabang terdekat kami.</p>
            </div>
          </div>
        </div>

        <div className="contact__card reveal">
          <div className="contact__info">
            <p className="eyebrow eyebrow--gold">Pesan Sekarang</p>
            <h2>
              Tunaikan Aqiqah Ananda dengan <em>Tenang &amp; Berkah</em>
            </h2>
            <p>Isi formulir singkat ini — pesanan tercatat di sistem kami dan diteruskan ke WhatsApp admin.</p>
            <ul className="contact__list">
              {s.admins.map((a) => (
                <li key={a.wa}>
                  <span>☎</span>
                  <a href={waLink(a.wa)} target="_blank" rel="noopener">
                    {a.label} · {a.display}
                  </a>
                </li>
              ))}
              {s.instagram && (
                <li>
                  <span>◎</span>
                  <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener">
                    @{s.instagram}
                  </a>
                </li>
              )}
              <li>
                <span>⌖</span>
                {s.area}
              </li>
              <li>
                <span>◷</span>
                {s.serviceHours}
              </li>
            </ul>
          </div>
          <OrderForm />
        </div>
      </div>
    </section>
  );
}
