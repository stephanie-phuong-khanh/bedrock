'use client';

import VendorsTab from './VendorsTab';

interface VendorsViewProps {
  showAddVendor?: boolean;
}

export default function VendorsView({ showAddVendor }: VendorsViewProps) {
  return (
    <div className="space-y-6">
      {/* Main Vendors Content */}
      <VendorsTab showAddVendor={showAddVendor} />
    </div>
  );
}
