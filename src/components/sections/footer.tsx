import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-foreground">Azelea</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Professional HVAC services for residential and corporate clients. Quality installation, maintenance, and repair solutions.
            </p>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="/services">
                  Aircon Installation
                </a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="/services">
                  Aircon Cleaning
                </a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="/services">
                  Aircon Repairs
                </a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="/services">
                  Dismantle & Relocation
                </a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="/services">
                  Freon Charging
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div className="flex flex-col sm:flex-row sm:space-x-2 text-muted-foreground">
                  <span>+639336804706</span>
                  <span className="hidden sm:inline">|</span>
                  <span>+639425384191</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">azeleaaircon@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Westwood Highland Phase 2 Blk Lot 7 Brgy Langkaan, Dasmarinas Cavite Philippines
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-muted-foreground">Mon - Sat: 8:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Sun: Emergency Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-balance">
          <p className="text-muted-foreground text-sm">
            © 2025 Azelea Aircon & Refrigeration System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}