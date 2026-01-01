"use client";

import React, { useState, useEffect } from "react";
import { Phone, Menu, X, User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check session and role
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'client');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role || 'client'));
      } else {
        setRole(null);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-border"
          : "bg-white border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <a href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-[#0062a3] rounded-lg flex items-center justify-center transition-transform hover:scale-105">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-[#020617] tracking-tight">
              Azelea
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#020617] hover:text-[#0062a3] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-[#64748b] font-medium">
                <Phone className="w-4 h-4 text-[#0062a3]" />
                <span>+639425384191</span>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#0062a3] text-white shadow-sm hover:bg-[#0062a3]/90 h-9 px-4 py-2 transition-all active:scale-95"
                >
                  Book Service
                </a>
                {user ? (
                  <div className="flex items-center gap-3">
                    {role === 'admin' && (
                      <a
                        href="/admin"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-primary/20 bg-primary/5 text-primary shadow-sm hover:bg-primary/10 h-9 px-4 py-2 transition-all gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </a>
                    )}
                    <a
                      href="/dashboard"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-[#e2e8f0] bg-white text-[#020617] shadow-sm hover:bg-[#f1f5f9] h-9 px-4 py-2 transition-all gap-2"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </a>
                  </div>
                ) : (
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-[#e2e8f0] bg-white text-[#020617] shadow-sm hover:bg-[#f1f5f9] h-9 px-4 py-2 transition-all"
                  >
                    Login
                  </a>
                )}
              </div>
            </div>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#020617] hover:bg-[#f1f5f9] rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-border transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-3 py-3 text-base font-medium text-[#020617] hover:bg-[#f1f5f9] rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 pb-2 border-t border-border mt-4">
            <div className="flex items-center px-3 py-3 text-sm text-[#64748b] mb-4">
              <Phone className="w-4 h-4 mr-3 text-[#0062a3]" />
              <span>+639425384191</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-3">
              <a
                href="/booking"
                className="flex items-center justify-center rounded-md text-sm font-medium bg-[#0062a3] text-white h-10 transition-all"
              >
                Book Service
              </a>
              <a
                href="/login"
                className="flex items-center justify-center rounded-md text-sm font-medium border border-[#e2e8f0] bg-white text-[#020617] h-10 transition-all"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;