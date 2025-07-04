"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

interface Account {
  id: string;
  name: string;
  balance: {
    amount: string;
    currency: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAccounts();
    }
  }, [status]);

  const fetchAccounts = async () => {
    try {
      // Call our server-side API route instead of Coinbase directly
      const response = await fetch("/api/coinbase/accounts");
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.data) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Coinbase Wallets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="border p-4 rounded shadow">
            <h2 className="font-bold">{account.name}</h2>
            <p>
              Balance: {account.balance.amount} {account.balance.currency}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
