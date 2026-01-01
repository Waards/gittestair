import React from 'react';
import { 
  Snowflake, 
  Wrench, 
  Shield, 
  Users, 
  Clock, 
  Award, 
  ArrowRight 
} from 'lucide-react';

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

export default function Services() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive HVAC solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              data-slot="card" 
              className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div data-slot="card-content" className="p-6">
                <service.icon 
                  className="w-12 h-12 text-primary mb-4" 
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a 
            href="/services" 
            data-slot="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-6"
          >
            View All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}