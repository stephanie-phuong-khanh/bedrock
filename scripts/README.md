# Coinbase API Test Scripts

This directory contains scripts for testing the Coinbase API directly, without going through the Next.js application.

## Setup

1. Install ts-node if you haven't already:
   ```
   npm install -g ts-node
   ```

2. Make sure you have the required dependencies:
   ```
   npm install dotenv
   ```

3. Set your test user ID in one of these ways:
   - Add `TEST_USER_ID=your-user-id` to your `.env.local` file
   - Pass it as a command line argument (see examples below)

## Usage

### Get Accounts

```bash
ts-node scripts/test-coinbase-api.ts <userId> accounts
```

### Send Crypto

```bash
ts-node scripts/test-coinbase-api.ts <userId> send <accountId> <to> <amount> <currency>
```

Example:
```bash
ts-node scripts/test-coinbase-api.ts 3403d1dd-88e7-5007-82f4-255eaae8ab4c send 9d8e7f6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f 0x8d52075d098c4cb84E5D9DbcdB57557316039888 0.01 USDC
```

### Using 2FA Token

If your API call requires 2FA, you can set the token in your `.env.local` file:

```
COINBASE_2FA_TOKEN=your-2fa-token
```

## Troubleshooting

- If you get a 401 error, your access token may be invalid or expired
- If you get a 402 error, you need to provide a 2FA token
- If you get a 400 error with "Invalid input parameter", check the request format against the Coinbase API documentation

## Coinbase API Documentation

- [Coinbase API Reference](https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-transactions)
- [Transactions API](https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-transactions)
