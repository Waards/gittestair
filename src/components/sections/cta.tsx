import React from 'react';
import { Phone } from 'lucide-react';

/**
 * CTA Section Component
 * 
 * Clones the "Ready to Get Started?" call-to-action section with the following characteristics:
 * - Solid blue background (#0062a4 / primary color)
 * - Centered white text (primary-foreground)
 * - Primary white "Book Service Now" button
 * - Transparent bordered "Contact Us" button with white border/text
 */
const CTASection = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        {/* Heading: Using H2 with specified typography from high-level design */}
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
          Ready to Get Started?
        </h2>
        
        {/* Subtext: Using Body Text styles with reduced opacity for visual hierarchy */}
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-pretty leading-relaxed">
          Contact us today for a free consultation and quote for your HVAC needs.
        </p>
        
        {/* Action Buttons Container */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA: "Book Service Now" - Solid secondary (white) background */}
          <a
            href="/booking"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 h-11 rounded-md px-8"
          >
            Book Service Now
          </a>
          
          {/* Secondary CTA: "Contact Us" - Transparent with white border */}
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary h-11 rounded-md px-8 group"
          >
            <Phone className="mr-2 w-4 h-4 transition-transform group-hover:scale-110" />
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;