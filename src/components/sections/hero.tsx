import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';

const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Subtle radial/linear gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background HeroSection_gradient" 
        style={{
          background: 'radial-gradient(circle at top right, rgba(0, 98, 163, 0.05), transparent), linear-gradient(to bottom, #ffffff, #f8fafc)'
        }}
      />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading with Highlighted "Comfort" */}
          <h1 className="text-[3.75rem] lg:text-6xl font-bold text-foreground mb-6 text-balance leading-[1.2] tracking-[-0.02em]">
            Professional HVAC Solutions for Your <span className="text-primary">Comfort</span>
          </h1>
          
          {/* lead paragraph */}
          <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-2xl mx-auto">
            Expert aircon installation, cleaning, and repair services for residential and corporate clients. Quality workmanship with reliable maintenance solutions.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookingForm 
              trigger={
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 rounded-md px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group">
                  Book a Service
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;