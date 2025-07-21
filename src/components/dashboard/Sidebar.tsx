'use client';

import { Session } from 'next-auth';
import { signOut } from "next-auth/react";
import Image from 'next/image';
import { useState } from 'react';
import ConnectWalletButton from './ConnectWalletButton';

interface SideBarProps {
  session: Session | null;
  activeItem: string;
  onItemChange: (item: string) => void;
}

export default function SideBar({ session, activeItem, onItemChange }: SideBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

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
            className={`w-full flex items-center px-6 py-2 text-base font-medium transition-colors ${
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

      {/* Connect Wallet Section */}
      <div className="px-4 py-4">
        <ConnectWalletButton />
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
              {session?.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt="User avatar" 
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-xs font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* User menu dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
