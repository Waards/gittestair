import React from 'react';
import { CircleCheckBig } from 'lucide-react';

/**
 * WhyChooseUs component
 * Clones the "Why Choose Azelea?" section with a two-column layout.
 * Left: List of benefits with icons.
 * Right: Mission & Vision statements in a light blue gradient box.
 */
const WhyChooseUs = () => {
  const benefits = [
    "Licensed and insured technicians",
    "24/7 emergency service available",
    "Competitive pricing with transparent quotes",
    "Quality parts and workmanship guarantee",
    "Serving both residential and corporate clients"
  ];

  return (
    <section className="py-16 lg:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Benefits List */}
          <div className="flex flex-col">
            <h2 className="text-[2.25rem] font-bold leading-[1.25] tracking-tight text-foreground mb-6">
              Why Choose Azelea?
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CircleCheckBig 
                      className="w-5 h-5 text-primary" 
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="text-[1rem] leading-[1.625] text-muted-foreground">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Mission & Vision Box */}
          <div className="bg-gradient-to-br from-[#0062a4]/10 to-[#0062a4]/05 rounded-[0.75rem] p-8 md:p-10">
            <div className="mb-8">
              <h3 className="text-[1.5rem] font-bold leading-[1.5] text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-[1rem] leading-[1.625] text-muted-foreground">
                To provide reliable, efficient, and affordable HVAC solutions that ensure optimal comfort for our clients while building long-term relationships through exceptional service.
              </p>
            </div>
            
            <div>
              <h3 className="text-[1.5rem] font-bold leading-[1.5] text-foreground mb-4">
                Our Vision
              </h3>
              <p className="text-[1rem] leading-[1.625] text-muted-foreground">
                To be the leading HVAC service provider in the region, known for innovation, quality, and customer satisfaction.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;