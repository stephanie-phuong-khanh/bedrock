'use client';

import { useSession } from "next-auth/react";
import LoginView from "@/components/LoginView";
import DashboardView from "@/components/DashboardView";

export default function Home() {
  const { data: session, status } = useSession();
  
  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bedrock</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // If authenticated, show dashboard
  if (session) {
    return <DashboardView />;
  }
  
  // If not authenticated, show login page
  return <LoginView />;
}
