import React from 'react';
import { Snowflake, Wrench, Shield, Users, Clock, Award, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Snowflake,
    title: "Aircon Installation",
    description: "Professional installation of new air conditioning units for homes and offices.",
  },
  {
    icon: Wrench,
    title: "Aircon Cleaning",
    description: "Deep cleaning and maintenance to keep your AC running efficiently.",
  },
  {
    icon: Shield,
    title: "Aircon Repairs",
    description: "Quick and reliable repair services for all AC brands and models.",
  },
  {
    icon: Users,
    title: "Dismantle & Relocation",
    description: "Safe dismantling and relocation of AC units during moves or renovations.",
  },
  {
    icon: Clock,
    title: "Freon Charging",
    description: "Professional refrigerant charging to restore cooling performance.",
  },
  {
    icon: Award,
    title: "Maintenance Plans",
    description: "Regular maintenance schedules to prevent issues and extend AC lifespan.",
  },
];

const ServicesGrid = () => {
  return (
    <section className="py-16 bg-[#f8fafc]/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[2.25rem] font-bold text-[#020617] mb-4 leading-[1.2] tracking-[-0.01em]">
            Our Services
          </h2>
          <p className="text-[1.125rem] text-[#64748b] max-w-2xl mx-auto text-pretty leading-[1.6]">
            Comprehensive HVAC solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                data-slot="card"
                className="bg-white text-[#020617] flex flex-col gap-6 rounded-[0.75rem] border border-[#e2e8f0] py-6 shadow-sm hover:translate-y-[-4px] hover:shadow-lg hover:border-transparent transition-all duration-200"
              >
                <div data-slot="card-content" className="p-6">
                  <Icon 
                    className="w-12 h-12 text-[#0062a3] mb-4" 
                    strokeWidth={1.5}
                  />
                  <h3 className="text-[1.25rem] font-semibold text-[#020617] mb-2 leading-[1.4]">
                    {service.title}
                  </h3>
                  <p className="text-[#64748b] text-[0.875rem] leading-[1.6]">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <div className="text-center mt-12">
          <a 
            href="/services"
            data-slot="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0062a3] bg-[#0062a3] text-white shadow-sm hover:bg-[#0062a3]/90 h-10 px-6 py-2"
          >
            View All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;