'use client';

import { Session } from 'next-auth';
import Image from 'next/image';
import AccountButton from '@/components/dashboard/AccountButton';

interface SideBarProps {
  session: Session | null;
  activeItem: string;
  onItemChange: (item: string) => void;
}

export default function SideBar({ session, activeItem, onItemChange }: SideBarProps) {

  const sidebarItems = [
    {
      id: 'bills',
      label: 'Bill Pay',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-64 bg-gray-50 min-h-screen flex flex-col">
      {/* Logo/Brand area */}
      <div className="p-6 flex items-center">
        <Image 
          src="/geode.svg" 
          alt="Geode Logo" 
          width={33} 
          height={33} 
          className="w-8 h-8"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemChange(item.id)}
            className={`w-full flex items-center pl-6 pr-0 py-2 text-base font-medium transition-colors ${
              activeItem === item.id
                ? 'bg-white text-primary-700 rounded-l-full'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`mr-4 ${activeItem === item.id ? 'text-primary-700' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="px-4 pt-2 pb-4">
        <AccountButton session={session} />
      </div>
    </div>
  );
}
