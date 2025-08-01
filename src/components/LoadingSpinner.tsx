import React from 'react';
import { Loader2 } from 'lucide-react';
import CompanyHeader from './CompanyHeader';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader variant="minimal" />
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}