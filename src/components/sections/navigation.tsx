"use client";

import React, { useState } from "react";
import { Phone, Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <a className="flex items-center space-x-2" href="/">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-foreground">Azelea</span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              className="text-foreground hover:text-primary transition-colors text-[16px] font-normal"
              href="/"
            >
              Home
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-[16px] font-normal"
              href="/services"
            >
              Services
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-[16px] font-normal"
              href="/about"
            >
              About Us
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-[16px] font-normal"
              href="/contact"
            >
              Contact
            </a>
          </div>

          {/* Desktop Action Buttons & Phone */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mr-4">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-[14px]">+639425384191</span>
            </div>
            <a
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
              href="/booking"
            >
              Book Service
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border border-border bg-background shadow-sm hover:bg-secondary hover:text-primary h-9 px-4 py-2"
              href="/login"
            >
              Login
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border absolute w-full left-0 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4 p-4">
            <a
              className="text-foreground hover:text-primary transition-colors text-lg font-medium"
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-lg font-medium"
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-lg font-medium"
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors text-lg font-medium"
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 border-t border-border flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+639425384191</span>
              </div>
              <a
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4"
                href="/booking"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Service
              </a>
              <a
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-border bg-background h-10 px-4"
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;