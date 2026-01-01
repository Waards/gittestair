import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/hero";
import ServicesGrid from "@/components/sections/services";
import WhyChooseUs from "@/components/sections/why-choose-us";
import CTA from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-grow pt-16">
        <HeroSection />
        <ServicesGrid />
        <WhyChooseUs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
