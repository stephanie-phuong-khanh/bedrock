"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Bedrock Pay</h1>
      <p className="text-lg mb-8 text-gray-600 max-w-md text-center">
        Connect your Coinbase account to send stablecoins and manage your transactions
      </p>
      <button
        onClick={() => signIn("coinbase")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center"
      >
        <svg className="w-6 h-6 mr-2" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="512" cy="512" r="512" fill="white"/>
          <path d="M516.3 188C336.1 188 190 334.1 190 514.3C190 694.5 336.1 840.6 516.3 840.6C696.5 840.6 842.6 694.5 842.6 514.3C842.6 334.1 696.5 188 516.3 188ZM516.3 716.3C404.8 716.3 314.3 625.8 314.3 514.3C314.3 402.8 404.8 312.3 516.3 312.3C627.8 312.3 718.3 402.8 718.3 514.3C718.3 625.8 627.8 716.3 516.3 716.3Z" fill="#0052FF"/>
        </svg>
        Sign in with Coinbase
      </button>
    </main>
  );
}
