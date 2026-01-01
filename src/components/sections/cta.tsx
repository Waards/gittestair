import React from 'react';
import { Phone } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-[-0.01em] leading-[1.2]">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-pretty leading-[1.6]">
          Contact us today for a free consultation and quote for your HVAC needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/booking"
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#f1f5f9] text-[#0062a3] hover:bg-[#f1f5f9]/80 h-10 rounded-md px-6 shadow-sm"
          >
            Book Service Now
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white text-white hover:bg-white hover:text-[#0062a3] bg-transparent h-10 rounded-md px-6"
          >
            <Phone className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;