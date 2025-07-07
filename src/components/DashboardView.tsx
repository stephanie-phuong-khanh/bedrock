'use client';

import { signOut, useSession } from "next-auth/react";

export default function DashboardView() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bedrock Pay</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
          <p className="text-gray-600">Welcome to your dashboard!</p>
        </div>
        
        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              New Transaction
            </button>
          </div>
          
          {/* Placeholder for transaction list */}
          <div className="border rounded-md p-8 text-center text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Your transaction history will appear here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
