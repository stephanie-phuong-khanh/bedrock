"use client";

import { useState, useEffect } from "react";
import { isAddress } from "viem";
import { Vendor } from "@/types/supabase";
import {
  getEnabledCryptocurrencies,
  getEnabledFiatCurrencies,
  getEnabledNetworks,
} from "../../constants/crypto";

interface PaymentFormProps {
  vendors: Vendor[];
  isLoadingVendors: boolean;
  errorMessage: string | null;
  onSubmit: (formData: PaymentFormData) => void;
  selectedVendor?: Vendor | null;
  onVendorChange?: (vendor: Vendor | null) => void;
  initialFormData?: PaymentFormData | null;
}

export interface PaymentFormData {
  selectedVendor: Vendor | null;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAsset: string;
  cryptoAmount: string;
  fxRate: number;
  walletAddress: string;
  network: string;
  category: string;
  memo: string;
}

export default function PaymentForm({
  vendors,
  isLoadingVendors,
  errorMessage,
  onSubmit,
  selectedVendor: initialSelectedVendor,
  onVendorChange,
  initialFormData,
}: PaymentFormProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(
    initialSelectedVendor || null
  );
  const [fiatAmount, setFiatAmount] = useState<string>(
    initialFormData?.fiatAmount || "0"
  );
  const [fiatCurrency, setFiatCurrency] = useState<string>(
    initialFormData?.fiatCurrency || ""
  );
  const [cryptoAsset, setCryptoAsset] = useState<string>(
    initialFormData?.cryptoAsset || ""
  );
  const [walletAddress, setWalletAddress] = useState<string>(
    initialFormData?.walletAddress || ""
  );
  const [network, setNetwork] = useState<string>(
    initialFormData?.network || ""
  );
  const [category, setCategory] = useState<string>(
    initialFormData?.category || ""
  );
  const [memo, setMemo] = useState<string>(initialFormData?.memo || "");
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);

  // Initialize wallet address validation if initial data is provided
  useEffect(() => {
    if (initialFormData?.walletAddress) {
      validateWalletAddress(initialFormData.walletAddress);
    }
  }, [initialFormData?.walletAddress]);

  // Update selectedVendor when prop changes
  useEffect(() => {
    if (initialSelectedVendor !== selectedVendor) {
      setSelectedVendor(initialSelectedVendor || null);
    }
  }, [initialSelectedVendor]);

  // Validate wallet address
  const validateWalletAddress = (address: string) => {
    if (!address) {
      setIsAddressValid(null);
      return;
    }

    const isValid = isAddress(address);
    setIsAddressValid(isValid);
    return isValid;
  };

  // Handle wallet address change
  const handleWalletAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setWalletAddress(value);
    validateWalletAddress(value);
  };

  // Check if all required fields are filled
  const isFormComplete =
    selectedVendor &&
    parseFloat(fiatAmount) > 0 &&
    fiatCurrency !== "" &&
    walletAddress.trim() !== "" &&
    network !== "" &&
    isAddressValid === true;

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value;
    if (!vendorId) {
      setSelectedVendor(null);
      onVendorChange?.(null);
      return;
    }

    const vendor = vendors.find((v) => v.id === vendorId);
    setSelectedVendor(vendor || null);
    onVendorChange?.(vendor || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Explicitly check each required field
    if (!selectedVendor) {
      alert("Please select a vendor");
      return;
    }

    if (!fiatAmount) {
      alert("Please enter an amount");
      return;
    }

    if (!fiatCurrency) {
      alert("Please select a currency");
      return;
    }

    if (!walletAddress.trim()) {
      alert("Please enter a wallet address");
      return;
    }

    if (!network) {
      alert("Please select a payment network");
      return;
    }

    if (!isAddressValid) {
      alert("Please enter a valid EVM wallet address");
      return;
    }

    // If all validations pass, call onSubmit with form data
    // TODO: Revisit `cryptoAsset` and `fxRate` once more fiat currencies and crypto assets are supported beyond USD and USDC respectively.
    onSubmit({
      selectedVendor,
      fiatAmount,
      fiatCurrency,
      cryptoAsset,
      cryptoAmount: fiatAmount, // Same as fiat_amount for USD:USDC parity
      fxRate: 1.0, // Hardcoded USD:USDC parity
      walletAddress,
      network,
      category,
      memo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>

        <div>
          <label
            htmlFor="vendor-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vendor *
          </label>
          <select
            id="vendor-select"
            className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent mb-4"
            value={selectedVendor?.id || ""}
            onChange={handleVendorChange}
            disabled={isLoadingVendors}
            required
          >
            <option value="">Select a vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} {vendor.email ? `(${vendor.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount *
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 bg-white">
                <input
                  type="text"
                  id="fiat_amount"
                  className="w-full py-2 px-2 focus:outline-none bg-transparent"
                  value={fiatAmount}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Allow digits + optional dot + up to 4 decimal digits
                    if (/^\d*\.?\d{0,4}$/.test(rawValue)) {
                      setFiatAmount(rawValue);
                    }
                    // Handle pasted values with too many decimals
                    else if (/^\d*\.?\d+$/.test(rawValue)) {
                      const dotIndex = rawValue.indexOf(".");
                      if (dotIndex !== -1) {
                        const truncated = rawValue.substring(0, dotIndex + 5);
                        setFiatAmount(truncated);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (fiatAmount !== "") {
                      const num = parseFloat(fiatAmount);
                      if (!isNaN(num) && num < 0.0001) {
                        setFiatAmount("0.00");
                      }
                    }
                  }}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fiat_currency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Currency *
              </label>
              <select
                id="fiat_currency"
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                required
              >
                <option value="">Select</option>
                {Object.values(getEnabledFiatCurrencies()).map((fiat) => (
                  <option
                    key={fiat.symbol}
                    value={fiat.symbol}
                    disabled={!fiat.isEnabled}
                  >
                    {fiat.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="crypto_asset"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Crypto asset *
            </label>
            <select
              id="crypto_asset"
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
              value={cryptoAsset}
              onChange={(e) => setCryptoAsset(e.target.value)}
              required
            >
              <option value="">Select</option>
              {Object.values(getEnabledCryptocurrencies()).map((crypto) => (
                <option
                  key={crypto.symbol}
                  value={crypto.symbol}
                  disabled={!crypto.isEnabled}
                >
                  {crypto.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="wallet-address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wallet address *
            </label>
            <span className="text-gray-500">
              Only EVM wallets are supported
            </span>
            <div className="relative">
              <input
                type="text"
                id="wallet-address"
                className={`w-full py-2 px-3 border rounded focus:outline-none focus:border-black bg-transparent
                  ${isAddressValid === false ? "border-red-500" : ""}
                  ${
                    isAddressValid === true
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                value={walletAddress}
                onChange={handleWalletAddressChange}
                placeholder="0x..."
                required
              />
              <div className="text-xs mt-1">
                {isAddressValid === false && (
                  <p className="text-red-500 mt-1">
                    Please enter a valid EVM wallet address
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment network *
            </label>
            <select
              id="network"
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              required
            >
              <option value="">Select</option>
              {getEnabledNetworks().map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Professional Services">
                Professional Services
              </option>
              <option value="Software & SaaS">Software &amp; SaaS</option>
              <option value="Marketing & Advertising">
                Marketing &amp; Advertising
              </option>
              <option value="Utilities">Utilities</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="memo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Memo
            </label>
            <textarea
              id="memo"
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-black bg-transparent"
              rows={3}
              placeholder="Additional notes about this payment"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className={`w-full bg-black text-white font-medium py-3 px-4 rounded ${
              !isFormComplete
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-800"
            }`}
            disabled={!isFormComplete}
            aria-disabled={!isFormComplete}
            onClick={(e) => {
              if (!isFormComplete) {
                e.preventDefault();
                // Identify which fields are missing
                if (!selectedVendor) alert("Please select a vendor");
                else if (!fiatAmount) alert("Please enter an amount");
                else if (!fiatCurrency) alert("Please select a currency");
                else if (!cryptoAsset) alert("Please select a crypto asset");
                else if (!walletAddress.trim())
                  alert("Please enter a wallet address");
                else if (!network) alert("Please select a payment network");
                else if (!isAddressValid)
                  alert("Please enter a valid EVM wallet address");
              }
            }}
          >
            Review Payment
          </button>
        </div>
      </div>
    </form>
  );
}
