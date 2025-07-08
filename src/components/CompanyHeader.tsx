import React from 'react';
import { Phone, Mail, Building2 } from 'lucide-react';

interface CompanyHeaderProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export default function CompanyHeader({ variant = 'default', className = '' }: CompanyHeaderProps) {
  if (variant === 'minimal') {
    return (
      <div className={`bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm">
          <div className="flex items-center gap-2 mb-1 sm:mb-0">
            <Building2 className="h-4 w-4" />
            <span className="font-semibold">Artha Amogha Apparels (OPC) Private Limited</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>7397755561 / 8122496745</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>info@arthaamoghaapparels.in</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-full">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
                Artha Amogha Apparels (OPC) Private Limited
              </h1>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-medium">7397755561 / 8122496745</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-blue-300"></div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">info@arthaamoghaapparels.in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}