'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginView() {
  const [isNewUser, setIsNewUser] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bedrock Pay</h1>
          <p className="text-gray-600 mb-8">Your financial OS for stablecoin payments</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setIsNewUser(false)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  !isNewUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsNewUser(true)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  isNewUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
          
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.001 4.478-10.001 10s4.479 10 10.001 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.081z" />
              </svg>
            </span>
            {isNewUser ? 'Sign up with Google' : 'Sign in with Google'}
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
