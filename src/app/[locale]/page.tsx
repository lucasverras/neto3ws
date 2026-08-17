import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Origin } from "@/components/sections/Origin";
import { Services } from "@/components/sections/Services";
import { WhatWeBuy } from "@/components/sections/WhatWeBuy";
import { Categories } from "@/components/sections/Categories";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Differentials } from "@/components/sections/Differentials";
import { Sustainability } from "@/components/sections/Sustainability";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getDictionary, isLocale } from "@/lib/i18n";
import { organizationJsonLd } from "@/lib/stock/generateMetadata";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "pt");

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
        <Origin />
        <Services />
        <WhatWeBuy />
        <Categories />
        <HowItWorks />
        <Differentials />
        <Sustainability />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationJsonLd(),
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: dict.meta.home.title,
              description: dict.meta.home.description,
            },
          ]),
        }}
      />
    </>
  );
}
