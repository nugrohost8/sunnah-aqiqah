import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const { logoMain, siteName } = await getSiteSettings();
  return (
    <div className="a-login">
      <div className="a-login__card">
        {/* Logo bisa hasil upload dengan rasio bebas, jadi pakai <img> dengan tinggi tetap dari CSS. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="a-login__logo" src={logoMain} alt={siteName} />
        <h1>Panel Admin</h1>
        <p>Masuk untuk mengelola paket, konten, dan pesanan.</p>
        <LoginForm />
      </div>
    </div>
  );
}
