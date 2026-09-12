import React from 'react';
import Link from 'next/link';
import { FinethyLogo } from './finethy-logo';



export function FinethyHeader() {
  return (
    <header className="w-full flex flex-col shadow-sm sticky top-0 z-50">
      {/* Top Bar - Contact Details */}
      <div className="bg-brand-footerBg text-white text-xs py-2 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex gap-6 max-w-7xl mx-auto w-full">
          <a href="tel:+918904056464" className="hover:text-brand-orange transition-colors flex items-center gap-2">
            <span>📞</span> +91-89040 56464
          </a>
          <a href="mailto:SUPPORT@FINETHY.CO" className="hover:text-brand-orange transition-colors flex items-center gap-2">
            <span>✉️</span> SUPPORT@FINETHY.CO
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-brand-card py-4 px-4 sm:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center h-full">
            <FinethyLogo className="h-[44px]" />
          </Link>

          {/* Nav Links - Desktop Only */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-darkText">
            <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">About Us</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">Services</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">Contact</Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">

            <Link 
              href="/intake" 
              className="bg-brand-orange hover:bg-[#d97700] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-all shadow-sm"
            >
              Start Fact-Finder
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
