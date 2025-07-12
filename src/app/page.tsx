'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import LoginView from "@/components/LoginView";
import DashboardView from "@/components/DashboardView";

export default function Home() {
  const { data: session, status } = useSession();
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Only run validation if we have a session
    if (session?.supabaseUid) {
      // Check if the user still exists in Supabase
      const validateUser = async () => {
        try {
          const response = await fetch(`/api/auth/validate?userId=${session.userId}`);
          if (response.ok) {
            const data = await response.json();
            setIsValidUser(data.valid);
            
            // If user no longer exists, sign out
            if (!data.valid) {
              console.log("User no longer exists in Supabase, signing out...");
              signOut();
            }
          } else {
            console.error("Failed to validate user");
            setIsValidUser(false);
          }
        } catch (error) {
          console.error("Error validating user:", error);
          setIsValidUser(false);
        }
      };
      
      validateUser();
    } else if (status !== "loading") {
      setIsValidUser(false);
    }
  }, [session, status]);
  
  // Show loading state while checking authentication
  if (status === "loading" || isValidUser === null) {
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
  
  // If authenticated and user is valid, show dashboard
  if (session && isValidUser) {
    return <DashboardView />;
  }
  
  // If not authenticated or user is invalid, show login page
  return <LoginView />;
}
