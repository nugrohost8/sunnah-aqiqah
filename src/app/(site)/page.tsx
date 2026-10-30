import { Bundling } from "@/components/site/Bundling";
import { Contact } from "@/components/site/Contact";
import { FaqSection, NasiBoxSection, Partners, Testimonials } from "@/components/site/ContentSections";
import { Navbar } from "@/components/site/Navbar";
import { Pricing } from "@/components/site/Pricing";
import { Reveal } from "@/components/site/Reveal";
import { HeroSlider } from "@/components/site/HeroSlider";
import { About, Features, Footer, Steps, TrustBar, WhatsAppFloat } from "@/components/site/StaticSections";
import { getHomeContent } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const [content, settings] = await Promise.all([getHomeContent(), getSiteSettings()]);
  const wa = settings.primaryWa;

  return (
    <>
      <Navbar waNumber={wa} siteName={settings.siteName} logo={settings.logoMain} />
      <main>
        <HeroSlider slides={content.slides} settings={settings} />
        <TrustBar />
        <About since={settings.since} />
        <Features />
        <Pricing masak={content.masak} tanpaMasak={content.tanpaMasak} waNumber={wa} />
        <NasiBoxSection items={content.nasiBoxes} />
        <Bundling rows={content.bundling} />
        <Steps />
        <Testimonials items={content.testimonials} />
        <Partners items={content.partners} />
        <FaqSection items={content.faqs} waNumber={wa} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} year={content.year} />
      <WhatsAppFloat waNumber={wa} />
      <Reveal />
    </>
  );
}
