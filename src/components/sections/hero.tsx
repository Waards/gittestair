import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * HeroSection component
 * 
 * Clones the hero section with a soft blue-to-white gradient background,
 * a large centered heading "Professional HVAC Solutions for Your Comfort"
 * with "Comfort" highlighted in primary blue.
 */
const HeroSection: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
      {/* Background Gradient Layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#0062a4]/5 to-background"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold text-[#0f172a] mb-6 text-balance leading-[1.2] tracking-[-0.02em]">
            Professional HVAC Solutions for Your{" "}
            <span className="text-[#0062a4]">Comfort</span>
          </h1>

          {/* Descriptive Text */}
          <p className="text-xl text-[#64748b] mb-8 text-pretty leading-[1.75] font-normal mx-auto max-w-2xl">
            Expert aircon installation, cleaning, and repair services for
            residential and corporate clients. Quality workmanship with reliable
            maintenance solutions.
          </p>

          {/* Primary Call-to-Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/booking"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0062a4] disabled:pointer-events-none disabled:opacity-50 bg-[#0062a4] text-white shadow-sm hover:bg-[#0062a4]/90 h-10 px-6"
            >
              Book a Service
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;