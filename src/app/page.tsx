'use client';

import LoginView from "@/components/dashboard/LoginView";
import DashboardView from "@/components/dashboard/DashboardView";
import { useValidatedSession } from "@/hooks/useValidatedSession";

export default function Home() {

  const { session, isValidUser, loading } = useValidatedSession();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bedrock</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // If authenticated and user is valid, show dashboard
  if (session && isValidUser) {
    return <DashboardView session={session} />;
  }
  
  // If not authenticated or user is invalid, show login page
  return <LoginView />;
}
