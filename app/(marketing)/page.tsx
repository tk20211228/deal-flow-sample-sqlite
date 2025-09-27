import Header from "@/components/header";
import HeroSection from "@/components/marketing/hero-section";
import FeaturesSection from "@/components/marketing/features-section";
import PricingSection from "@/components/marketing/pricing-section";
import TestimonialsSection from "@/components/marketing/testimonials-section";
import FaqSection from "@/components/marketing/faq-section";
import CtaSection from "@/components/marketing/cta-section";
import Footer from "@/components/footer";
import LogosSection from "@/components/marketing/logos-section";

export default function MarketingPage() {
  return (
    <>
      {/* <Header /> */}
      <div className="md:min-h-dvh p-4 flex flex-col light">
        <HeroSection />
      </div>
      {/* <LogosSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection /> */}
      <Footer />
    </>
  );
}
