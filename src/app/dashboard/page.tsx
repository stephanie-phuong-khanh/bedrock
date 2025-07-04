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

interface SendFormData {
  accountId: string;
  toAddress: string;
  amount: string;
  description: string;
  network: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [sendStep, setSendStep] = useState<'recipient' | 'amount' | 'network' | 'preview' | 'success'>('recipient');
  const [sendFormData, setSendFormData] = useState<SendFormData>({
    accountId: "",
    toAddress: "",
    amount: "",
    description: "",
    network: 'base',
  });
  const [sendStatus, setSendStatus] = useState({
    loading: false,
    success: false,
    error: "",
    requires2FA: false,
    transactionId: "",
  });
  const [twoFactorCode, setTwoFactorCode] = useState("");

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

  const handleSendClick = (account: Account) => {
    setSelectedAccount(account);
    setSendFormData({
      ...sendFormData,
      accountId: account.id,
      amount: '',
    });
    setShowSendModal(true);
    setSendStep('recipient');
    setSendStatus({
      loading: false,
      success: false,
      error: "",
      requires2FA: false,
      transactionId: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSendFormData({
      ...sendFormData,
      [name]: value,
    });
  };

  const handleNetworkSelect = (network: string) => {
    setSendFormData({
      ...sendFormData,
      network,
    });
    setSendStep('preview');
  };

  const handleNextStep = () => {
    if (sendStep === 'recipient' && sendFormData.toAddress) {
      setSendStep('amount');
    } else if (sendStep === 'amount' && sendFormData.amount) {
      setSendStep('network');
    }
  };

  const handlePreviousStep = () => {
    if (sendStep === 'amount') {
      setSendStep('recipient');
    } else if (sendStep === 'network') {
      setSendStep('amount');
    } else if (sendStep === 'preview') {
      setSendStep('network');
    }
  };

  const handleSendSubmit = async () => {
    if (!selectedAccount) return;
    
    setSendStatus({
      ...sendStatus,
      loading: true,
    });
    
    try {
      const transactionId = sendStatus.transactionId || crypto.randomUUID();
      
      const response = await fetch("/api/coinbase/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(twoFactorCode ? { "CB-2FA-TOKEN": twoFactorCode } : {}),
        },
        body: JSON.stringify({
          accountId: sendFormData.accountId,
          type: "send",
          to: sendFormData.toAddress,
          amount: sendFormData.amount,
          currency: selectedAccount.balance.currency,
          description: sendFormData.description,
          network: sendFormData.network,
          idem: transactionId, // Use the same ID for retries
        }),
      });
      
      const data = await response.json();
    
      if (!response.ok) {
        console.warn("Error sending crypto:", data, "Status:", response.status);
        
        // Check if this is a 2FA required error (status 402)
        if (response.status === 402 || data.requires2FA) {
          console.log("2FA required, prompting user");
          setSendStatus({
            ...sendStatus,
            loading: false,
            requires2FA: true,
            error: "Two-factor authentication required"
          });
          return;
        }
        
        throw new Error(data.error || "Failed to send crypto");
      }
      
      // Success case
      setSendStatus({
        loading: false,
        success: true,
        error: "",
        requires2FA: false,
        transactionId: data.data?.id || "",
      });
      
      // Refresh accounts after sending
      fetchAccounts();
      
      // Reset form
      setSendFormData({
        accountId: selectedAccount?.id || "",
        toAddress: "",
        amount: "",
        description: "",
        network: "",
      });
      
      // Reset 2FA code
      setTwoFactorCode("");
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowSendModal(false);
        setSendStatus({
          loading: false,
          success: false,
          error: "",
          requires2FA: false,
          transactionId: "",
        });
        setSendStep("recipient");
      }, 3000);
    } catch (error: any) {
      setSendStatus({
        loading: false,
        success: false,
        error: error.message || "An unexpected error occurred",
        requires2FA: false,
        transactionId: "",
      });
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSelectedAccount(null);
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
      
      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="border p-4 rounded shadow">
            <h2 className="font-bold">{account.name}</h2>
            <p className="mb-4">
              Balance: {account.balance.amount} {account.balance.currency}
            </p>
            <button
              onClick={() => handleSendClick(account)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
            >
              Send {account.balance.currency}
            </button>
          </div>
        ))}
      </div>

      {/* Send Crypto Modal */}
      {showSendModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {sendStep === 'recipient' && 'Send crypto to'}
                {sendStep === 'amount' && 'Enter amount'}
                {sendStep === 'network' && 'Select network'}
                {sendStep === 'preview' && `Send ${sendFormData.amount} ${selectedAccount.balance.currency}`}
                {sendStep === 'success' && 'Transaction sent'}
              </h2>
              <button 
                onClick={closeSendModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Recipient Step */}
            {sendStep === 'recipient' && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="toAddress"
                      value={sendFormData.toAddress}
                      onChange={handleInputChange}
                      placeholder="Email, address, invoice or ENS"
                      className="pl-10 shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">My wallet</h3>
                  <div className="flex items-center p-3 border rounded mb-4">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <span className="text-white text-xs">CB</span>
                    </div>
                    <div>
                      <p className="font-medium">Connect to Coinbase Wallet</p>
                      <p className="text-sm text-gray-500">Securely send funds onchain</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recents</h3>
                  <div className="text-gray-400 text-sm italic">No recent recipients</div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleNextStep}
                    disabled={!sendFormData.toAddress}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ${!sendFormData.toAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Amount Step */}
            {sendStep === 'amount' && (
              <div>
                <button onClick={handlePreviousStep} className="flex items-center text-blue-500 mb-4">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="mb-6 text-center">
                  <div className="text-4xl font-bold flex items-center justify-center">
                    <input
                      type="text"
                      name="amount"
                      value={sendFormData.amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-24 text-center border-none focus:outline-none text-4xl"
                    />
                    <span className="text-gray-400 ml-1">{selectedAccount.balance.currency}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {sendFormData.amount} {selectedAccount.balance.currency}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <span className="text-white">{selectedAccount.balance.currency.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{selectedAccount.balance.currency}</p>
                        <p className="text-sm text-gray-500">{selectedAccount.balance.amount} available</p>
                      </div>
                    </div>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded">
                      Max
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setSendFormData({...sendFormData, description: ''});
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-center"
                  >
                    Add note
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!sendFormData.amount}
                    className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ${!sendFormData.amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}

            {/* Network Step */}
            {sendStep === 'network' && (
              <div>
                <button onClick={handlePreviousStep} className="flex items-center text-blue-500 mb-4">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-medium">What should I pick?</h3>
                  </div>
                  <p className="text-sm text-gray-600">Select the network you're using to transfer the asset. <span className="text-blue-500">Learn more</span></p>
                </div>

                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Supported networks</h3>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => handleNetworkSelect('ethereum')}
                    className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <span className="text-white">ETH</span>
                      </div>
                      <div>
                        <p className="font-medium">Ethereum</p>
                        <p className="text-sm text-gray-500">Default</p>
                      </div>
                    </div>
                    <div className="text-gray-500">$0.159</div>
                  </div>

                  <div 
                    onClick={() => handleNetworkSelect('base')}
                    className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <span className="text-white">B</span>
                      </div>
                      <div>
                        <p className="font-medium">Base</p>
                        <p className="text-sm text-gray-500">Default</p>
                      </div>
                    </div>
                    <div className="text-gray-500">Free</div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {sendStep === 'preview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preview Transaction</h3>
                
                {sendStatus.requires2FA ? (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-800">Two-factor authentication required</p>
                      <p className="text-sm text-yellow-600 mt-1">Please enter the verification code sent to your phone</p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="twoFactorCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter code"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => {
                          setSendStatus({
                            ...sendStatus,
                            requires2FA: false,
                            error: ""
                          });
                          setTwoFactorCode("");
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendSubmit}
                        disabled={!twoFactorCode || sendStatus.loading}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${!twoFactorCode || sendStatus.loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {sendStatus.loading ? 'Verifying...' : 'Submit Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium">From:</span> {selectedAccount?.name}</p>
                      <p><span className="font-medium">To:</span> {sendFormData.toAddress}</p>
                      <p><span className="font-medium">Amount:</span> {sendFormData.amount} {selectedAccount?.balance.currency}</p>
                      {sendFormData.description && <p><span className="font-medium">Note:</span> {sendFormData.description}</p>}
                      {sendFormData.network && <p><span className="font-medium">Network:</span> {sendFormData.network}</p>}
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSendSubmit}
                        disabled={sendStatus.loading}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${sendStatus.loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {sendStatus.loading ? 'Sending...' : 'Confirm Send'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Success Step */}
            {sendStep === 'success' && (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Transaction sent!</h3>
                <p className="text-gray-500 mb-6">
                  {sendFormData.amount} {selectedAccount.balance.currency} has been sent to {sendFormData.toAddress.substring(0, 8)}...{sendFormData.toAddress.substring(sendFormData.toAddress.length - 8)}
                </p>
                {sendStatus.success && sendStatus.transactionId && (
                  <div className="text-center">
                    <p className="text-green-500 mb-2">Transaction ID: {sendStatus.transactionId}</p>
                  </div>
                )}
                <button
                  onClick={closeSendModal}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
