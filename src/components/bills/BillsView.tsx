'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DraftsTab from './DraftsTab';
import PaidTab from './PaidTab';

interface BillsViewProps {
  paymentsKey?: number;
}

export default function BillsView({ paymentsKey }: BillsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab state from URL parameters
  const [activeBillsTab, setActiveBillsTab] = useState(() => {
    return searchParams.get('tab') || 'drafts';
  });

  const tabs = [
    { id: 'drafts', label: 'Drafts' },
    { id: 'paid', label: 'Paid' }
  ];

  // Handle tab navigation with URL updates
  const handleTabNavigation = (tabId: string) => {
    setActiveBillsTab(tabId);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeBillsTab) {
      setActiveBillsTab(tab);
    }
  }, [searchParams, activeBillsTab]);

  const renderTabContent = () => {
    switch (activeBillsTab) {
      case 'drafts':
        return <DraftsTab />;
      case 'paid':
        return <PaidTab key={paymentsKey} />;
      default:
        return <DraftsTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabNavigation(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeBillsTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
