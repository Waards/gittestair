import React from 'react';
import { CircleCheckBig } from 'lucide-react';

/**
 * WhyChooseUs Section Component
 * 
 * Clones the "Why Choose Azelea?" section with pixel-perfect accuracy.
 * Features a two-column layout: 
 * - Left: List of value propositions with blue checkmarks.
 * - Right: A light blue gradient container for Mission and Vision statements.
 */
const WhyChooseUs = () => {
  const checkmarks = [
    "Licensed and insured technicians",
    "24/7 emergency service available",
    "Competitive pricing with transparent quotes",
    "Quality parts and workmanship guarantee",
    "Serving both residential and corporate clients"
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Value Propositions */}
          <div>
            <h2 className="text-[2.25rem] font-bold text-[#020617] mb-6 leading-[1.2] tracking-[-0.01em]">
              Why Choose Azelea?
            </h2>
            <div className="space-y-4">
              {checkmarks.map((text, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CircleCheckBig 
                      size={20} 
                      className="text-[#0062a3]" 
                    />
                  </div>
                  <span className="text-[#64748b] text-[1rem] leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Mission and Vision Styled Container */}
          <div className="bg-gradient-to-br from-[#0062a3]/10 to-[#0062a3]/05 rounded-2xl p-8 border border-[#e2e8f0]/50 shadow-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[#020617] mb-4 leading-[1.4]">
                Our Mission
              </h3>
              <p className="text-[#64748b] leading-relaxed text-[1rem]">
                To provide reliable, efficient, and affordable HVAC solutions that ensure optimal comfort for our clients while building long-term relationships through exceptional service.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[#020617] mb-4 leading-[1.4]">
                Our Vision
              </h3>
              <p className="text-[#64748b] leading-relaxed text-[1rem]">
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