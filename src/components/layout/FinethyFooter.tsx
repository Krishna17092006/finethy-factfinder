import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export function FinethyFooter() {
  return (
    <footer className="bg-[#1f2531] text-[#a9b5c9] py-12 border-t-[6px] border-brand-orange mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Section */}
        <div>
          <div className="mb-4">
            <span className="text-2xl font-bold text-white tracking-wide">FINETHY<span className="text-brand-orange">.</span></span>
          </div>
          <p className="text-sm leading-relaxed text-[#797e89] mb-4">
            Welcome to FINETHY LLP, where we understand the importance of securing your financial future. Our financial planning services are designed to provide customized solutions.
          </p>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <MapPin className="w-5 h-5 text-brand-orange" />
              <span>Visit Us</span>
            </div>
            <p className="text-sm leading-relaxed pl-7">
              Shop No. 288, II Floor,<br />
              100ft Outer Ring Road,<br />
              Kathriguppe IV Phase,<br />
              Banashankari III Stage,<br />
              Bengaluru, Karnataka 560085
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <Mail className="w-5 h-5 text-brand-orange" />
              <span>Mail Us</span>
            </div>
            <a href="mailto:SUPPORT@FINETHY.CO" className="text-sm pl-7 hover:text-white transition-colors duration-200">
              SUPPORT@FINETHY.CO
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <Phone className="w-5 h-5 text-brand-orange" />
              <span>Phone Us</span>
            </div>
            <a href="tel:+918904056464" className="text-sm pl-7 hover:text-white transition-colors duration-200">
              +91- 89040 56464
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-[#31394b] flex flex-col md:flex-row justify-between items-center text-xs">
        <p>© {new Date().getFullYear()} FINETHY LLP. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0">Financial Planning & Wealth Management</p>
      </div>
    </footer>
  );
}
