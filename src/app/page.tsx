import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { WhatWeBuy } from "@/components/sections/WhatWeBuy";
import { Categories } from "@/components/sections/Categories";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Differentials } from "@/components/sections/Differentials";
import { Sustainability } from "@/components/sections/Sustainability";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
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
    </>
  );
}
