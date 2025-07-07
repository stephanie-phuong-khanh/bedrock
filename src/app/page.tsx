'use client';

import { useSession } from "next-auth/react";
import LoginView from "@/components/LoginView";
import DashboardView from "@/components/DashboardView";

export default function Home() {
  const { data: session, status } = useSession();
  
  // Show loading state while checking authentication
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  // If authenticated, show dashboard
  if (session) {
    return <DashboardView />;
  }
  
  // If not authenticated, show login page
  return <LoginView />;
}
