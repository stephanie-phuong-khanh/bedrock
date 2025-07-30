// Supported cryptocurrencies
export interface CryptoCurrency {
  symbol: string;
  name: string;
  decimals: number;
  isEnabled: boolean;
}

// Networks supported by the application
export interface Network {
  id: string;
  name: string;
  chainId: number;
  blockExplorer: string;
  isEnabled: boolean;
}

// Token contract addresses by network
export interface TokenContracts {
  [network: string]: `0x${string}`;
}

// Supported fiat currencies
export interface FiatCurrency {
  symbol: string;
  name: string;
  isEnabled: boolean;
}

// Supported fiat currencies with their details
export const FIAT_CURRENCIES: Record<string, FiatCurrency> = {
  'USD': {
    symbol: 'USD',
    name: 'USD',
    isEnabled: true,
  },
  'EUR': {
    symbol: 'EUR',
    name: 'EUR',
    isEnabled: false,
  },
  'GBP': {
    symbol: 'GBP',
    name: 'GBP',
    isEnabled: false,
  },
};

// Supported cryptocurrencies with their details
export const CRYPTOCURRENCIES: Record<string, CryptoCurrency> = {
  'ETH': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isEnabled: false, // Not yet implemented
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isEnabled: true,
  },
  'USDT': {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    isEnabled: false, // Not yet implemented
  },
  'DAI': {
    symbol: 'DAI',
    name: 'Dai',
    decimals: 18,
    isEnabled: false, // Not yet implemented
  },
  'BTC': {
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    isEnabled: false, // Not yet implemented
  },
};

// Supported networks with their details
export const NETWORKS: Record<string, Network> = {
  'ethereum': {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
    isEnabled: true,
  },
  'base': {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    blockExplorer: 'https://basescan.org',
    isEnabled: true,
  },
  'arbitrum': {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: 42161,
    blockExplorer: 'https://arbiscan.io',
    isEnabled: true,
  },
  'optimism': {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io',
    isEnabled: false, // Not yet enabled
  },
  'polygon': {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com',
    isEnabled: false, // Not yet enabled
  },
  'avalanche': {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    blockExplorer: 'https://snowtrace.io',
    isEnabled: false, // Not yet enabled
  },
  'base-sepolia': {
    id: 'base-sepolia',
    name: 'Base Sepolia Testnet',
    chainId: 84532,
    blockExplorer: 'https://sepolia.basescan.org',
    isEnabled: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  }
};

// Token contract addresses by network
export const TOKEN_CONTRACTS: Record<string, TokenContracts> = {
  'USDC': {
    'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    'arbitrum': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as `0x${string}`,
    'optimism': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as `0x${string}`,
    'polygon': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as `0x${string}`,
    'avalanche': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' as `0x${string}`,
    'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  },
  // Add other tokens as they are implemented
  'USDT': {
    'ethereum': '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    // Add other networks as needed
  },
  'DAI': {
    'ethereum': '0x6B175474E89094C44Da98b954EedeAC495271d0F' as `0x${string}`,
    // Add other networks as needed
  },
};

const WHITELISTED_TESTNET_EMAILS = [
  'echulshin8@gmail.com',
  'stephaniekdoan@gmail.com'
];

// Helper functions
export function getEnabledFiatCurrencies(): FiatCurrency[] {
  return Object.values(FIAT_CURRENCIES).filter(fiat => fiat.isEnabled);
}

export function getEnabledCryptocurrencies(): CryptoCurrency[] {
  return Object.values(CRYPTOCURRENCIES).filter(crypto => crypto.isEnabled);
}

export function getEnabledNetworks(user?: { email?: string }): Network[] {
  return Object.values(NETWORKS).filter(network => network.isEnabled || (WHITELISTED_TESTNET_EMAILS.includes(user?.email || '') && network.id === 'base-sepolia'));
}

export function getBlockExplorerUrl(network: string, txHash: string): string {
  const networkObj = NETWORKS[network.toLowerCase()];
  if (!networkObj || !networkObj.blockExplorer) {
    return '';
  }
  return `${networkObj.blockExplorer}/tx/${txHash}`;
}

export function getTokenContractAddress(token: string, network: string): `0x${string}` | undefined {
  return TOKEN_CONTRACTS[token]?.[network.toLowerCase()];
}

export function getPaymentNetworkNameFromId(id: string): string {
  const network = NETWORKS[id];
  return network ? network.name : 'Unknown Network';
}

// Accessor functions for CRYPTOCURRENCIES
export function getCryptocurrency(symbol: string): CryptoCurrency | undefined {
  return CRYPTOCURRENCIES[symbol];
}

export function isCryptocurrencyEnabled(symbol: string): boolean {
  return CRYPTOCURRENCIES[symbol]?.isEnabled || false;
}

export function getCryptocurrencyDecimals(symbol: string): number {
  return CRYPTOCURRENCIES[symbol]?.decimals || 18;
}

// Accessor functions for NETWORKS
export function getNetwork(id: string): Network | undefined {
  return NETWORKS[id];
}

export function getNetworkChainId(id: string): number | undefined {
  return NETWORKS[id]?.chainId;
}
