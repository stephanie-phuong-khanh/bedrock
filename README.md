# Bedrock

A simple web app for users to pay their bills in stablecoins and track their payments to be accounting-ready.

## Overview

- **Frontend/Backend**: Next.js 15, deployed on Vercel at https://bedrock.vercel.app
- **Authentication**: NextAuth.js with Google OAuth
- **Database/Storage**: Supabase

## Local Development

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
# Generate your own random secret using `openssl rand -base64 32`
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
# Ask someone with access to the `Bedrock` Google Cloud Project for these credentials under the `bedrock-dev` OAuth 2.0 Client
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
# Ask for access to the `bedrock-dev` Supabase project
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Dynamic (https://app.dynamic.xyz/)
# Ask for access to the `bedrock-dev` Dynamic project
NEXT_PUBLIC_DYNAMIC_ENV_ID=your-dynamic-env-id

# This is used to enable Base Sepolia Testnet
NEXT_PUBLIC_ENVIRONMENT=development
```

### Set up for Base Sepolia Testnet

1. In MetaMask, you have to `Select Network` and select (or create custom) Base Sepolia with the following details:
    - Network Name: `Base Sepolia Testnet`
    - New RPC URL: `https://sepolia.base.org`
    - Chain ID: `84532`
    - Symbol: `ETH`
    - Block Explorer URL: `https://sepolia.basescan.org`
2. Under Tokens and the three dots, click `+ Import tokens` and select `Base Sepolia Testnet`. The Token contract address is `0x036CbD53842c5426634e7929541eC2318f3dCF7e` and the Token symbol is `USDC`.
3. Get Base Sepolia ETH (for gas fees) by visiting [Coinbase Developer Platform Faucet](https://developer.coinbase.com/docs/wallet/faucets/base-sepolia), connecting wallet and requesting ETH.
4. Get Test USDC on Base Sepolia by visiting [Circle USDC Testnet Faucet](https://faucet.circle.com/), selecting Base Sepolia, inputting your wallet address, and requesting USDC.
5. When going through the payment flow in development and don't want to use real money, select `Base Sepolia Testnet` and `USDC` as the currency.


### Installation and Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Currently, `npm run dev` does not work after adding Dynamic libraries, so run `npm run build` and `npm run start` instead
# TODO: fix this
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Access Requirements

- **Vercel**: Request access to the `bedrock` Vercel project
- **Supabase**: Request access to the `bedrock-prod` Supabase project
- **Dynamic**: Request access to the `bedrock` Dynamic project
- **Google Cloud**: Request access to the `Bedrock` Google Cloud Project

### Deployment Process

1. **Environment Variables**: Already configured in Vercel project settings
   - Set up production environment variables locally by copying the content of Settings > Environment Variables and pasting it into an `.env` file.

2. **Continuous Deployment**:
   - Pushing to the `main` branch automatically triggers deployment
   - Run `npm run build` locally before pushing to catch any linting errors
   - Failed builds will prevent deployment on Vercel
