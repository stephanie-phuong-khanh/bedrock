'use client';

import { signOut, useSession } from "next-auth/react";
import { useState } from 'react';
import Image from 'next/image';
import VendorsTab from './VendorsTab';
import PaymentTab from './PaymentTab';

export default function DashboardView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('transactions');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold">Bedrock BillPay</h1>
        <p className="text-gray-600 mt-1">Manage your crypto bill payments</p>
        
        {/* Tab Navigation */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Start New Payment
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Vendors
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'transactions' && (
            <div className="min-h-[400px]">
              {/* Transaction content will go here */}
            </div>
          )}
          
          {activeTab === 'payment' && (
            <div className="min-h-[400px]">
              <PaymentTab />
            </div>
          )}
          
          {activeTab === 'vendors' && (
            <div className="min-h-[400px]">
              <VendorsTab />
            </div>
          )}
        </div>
      </div>
      
      {/* User Avatar in bottom left */}
      <div className="fixed bottom-6 left-6">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
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
        </button>
        
        {/* User menu popup */}
        {showUserMenu && (
          <div className="absolute bottom-12 left-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
