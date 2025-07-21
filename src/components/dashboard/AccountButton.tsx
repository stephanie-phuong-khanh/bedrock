'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { signOut } from "next-auth/react";
import Image from 'next/image';

interface AccountButtonProps {
  session: Session | null;
}

export default function AccountButton({ session }: AccountButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowModal(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowModal(!showModal)}
        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg bg-white focus:outline-none"
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
          <p className="text-sm font-normal text-gray-900 truncate">
            {session?.user?.name || 'User'}
          </p>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${showModal ? '' : 'rotate-180'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Modal positioned above the button */}
      {showModal && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowModal(false)}
          />
          {/* Modal content */}
          <div 
            className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50 min-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info section */}
            <div className="flex items-center mb-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                {session?.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="User avatar" 
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            
            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
