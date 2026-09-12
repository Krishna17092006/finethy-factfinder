import React from "react";
import { cn } from "@/lib/utils";

interface FinethyLogoProps {
  className?: string;
}

export function FinethyLogo({ className }: FinethyLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/logo.png" 
        alt="FINETHY Logo" 
        className="h-full w-auto object-contain"
        style={{ maxHeight: '44px' }}
      />
    </div>
  );
}

export function FinethyFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("bg-[#2d3340] text-white py-12 px-6 sm:px-12", className)}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Column 1: Brand & Disclaimer */}
        <div className="space-y-4">
          <FinethyLogo className="bg-white inline-flex p-2 rounded-md h-12" />
          <p className="text-sm text-brand-mutedText leading-relaxed mt-4">
            FINETHY LLP is an AMFI-registered Mutual Fund Distributor.
          </p>
          <div className="text-xs text-brand-mutedText space-y-1">
            <p>ARN-28883</p>
            <p>EUIN E045709</p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm text-brand-mutedText">
            <li><a href="#" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-brand-orange transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-brand-orange transition-colors">Services</a></li>
            <li><a href="#" className="hover:text-brand-orange transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Us</h3>
          <ul className="space-y-3 text-sm text-brand-mutedText">
            <li className="flex items-start gap-3">
              <span className="text-brand-orange">📍</span>
              <span>#56, 4th Floor, Sumukha Plaza, Puttanna Rd,<br/>Basavanagudi, Bengaluru 560004</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-brand-orange">📞</span>
              <a href="tel:+918904056464" className="hover:text-white transition-colors">+91-89040 56464</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-brand-orange">✉️</span>
              <a href="mailto:clientsupport@candorfs.com" className="hover:text-white transition-colors">clientsupport@candorfs.com</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-700 text-center">
        <p className="italic text-xs text-brand-mutedText">
          &quot;Mutual Fund investments are subject to market risks. Read all scheme related documents carefully.&quot;
        </p>
        <p className="text-xs text-brand-mutedText mt-2">
          © {new Date().getFullYear()} FINETHY LLP. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
