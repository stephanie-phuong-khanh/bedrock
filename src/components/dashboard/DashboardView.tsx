'use client';

import { Session } from 'next-auth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SideBar from './SideBar';
import BillsView from '../bills/BillsView';
import VendorsView from '../vendors/VendorsView';

interface DashboardViewProps {
  session: Session | null;
}

export default function DashboardView({ session }: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial state from URL parameters
  const [activeSidebarItem, setActiveSidebarItem] = useState(() => {
    return searchParams.get('section') || 'bills';
  });

  // Handle sidebar navigation with URL updates
  const handleSidebarNavigation = (section: string) => {
    setActiveSidebarItem(section);
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', section);
    
    // Clear bills-specific parameters when switching to vendors
    if (section === 'vendors') {
      params.delete('tab');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };



  // Sync state with URL changes
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && section !== activeSidebarItem) {
      setActiveSidebarItem(section);
    }
  }, [searchParams, activeSidebarItem]);

  // Get page title based on active sidebar item


  // Render main content based on active sidebar item
  const renderMainContent = () => {
    switch (activeSidebarItem) {
      case 'bills':
        return (
          <div className="min-h-[400px]">
            <BillsView />
          </div>
        );
      case 'vendors':
        return (
          <div className="min-h-[400px]">
            <VendorsView />
          </div>
        );
      default:
        return (
          <div className="min-h-[400px]">
            <BillsView />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <SideBar 
          session={session}
          activeItem={activeSidebarItem}
          onItemChange={handleSidebarNavigation}
        />
        
        {/* Main Content */}
        <div className="flex-1 pt-3">
          {/* Main Content Area */}
          <div className="bg-white rounded-tl-2xl p-8 min-h-[calc(100vh-0.75rem)]">
            {renderMainContent()}
          </div>
        </div>
      </div>

    </div>
  );
}
