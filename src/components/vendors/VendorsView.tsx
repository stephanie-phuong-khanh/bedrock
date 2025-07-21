'use client';

import { useState, useEffect } from 'react';
import VendorsTab from './VendorsTab';

export default function VendorsView() {
  const [showAddVendor, setShowAddVendor] = useState(false);

  // Handle add vendor button click
  const handleAddVendorClick = () => {
    setShowAddVendor(true);
    // Reset after trigger is processed
    setTimeout(() => setShowAddVendor(false), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add vendor button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          onClick={handleAddVendorClick}
        >
          Add vendor
        </button>
      </div>

      {/* Main Vendors Content */}
      <VendorsTab showAddVendor={showAddVendor} />
    </div>
  );
}
