import React from 'react';

/**
 * Formats a wallet address to show only the first 6 and last 4 characters
 * Example: "0x1234...5678"
 */
export const formatTruncatedAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a full wallet address with styled highlighting
 * - "0x" prefix in dark text
 * - First 4 characters after "0x" in dark text
 * - Middle portion in light grey
 * - Last 4 characters in dark text
 */
export const formatStyledAddress = (address: string): React.ReactNode => {
  if (!address || address.length < 10) return address;
  
  const prefix = address.slice(0, 2); // "0x"
  const start = address.slice(2, 6); // First 4 after "0x"
  const middle = address.slice(6, -4); // Middle portion
  const end = address.slice(-4); // Last 4
  
  return (
    <span className="font-mono">
      <span className="text-gray-900">{prefix}</span>
      <span className="text-gray-900">{start}</span>
      <span className="text-gray-400">{middle}</span>
      <span className="text-gray-900">{end}</span>
    </span>
  );
};
