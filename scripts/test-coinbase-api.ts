import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Fix for ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using default .env');
  dotenv.config();
}

const keyName = process.env.COINBASE_API_KEY_ID;
const keySecret = process.env.COINBASE_API_SECRET;
const accessToken = process.env.COINBASE_ACCESS_TOKEN; // Alternative: use an OAuth access token
const requestMethod = 'GET';
const requestHost = 'api.coinbase.com';
const requestPath = '/v2/accounts'; // Using v2 API which works with OAuth tokens
const algorithm = 'HS256'; // Using HS256 which works with string secrets

const uri = `${requestMethod} ${requestHost}${requestPath}`;

const generateJWT = (): string | null => {
  // Check if we have the required keys
  if (!keyName || !keySecret) {
    console.error('Missing required environment variables: COINBASE_API_KEY_ID and/or COINBASE_API_SECRET');
    return null;
  }

  const payload = {
    iss: 'cdp',
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120,
    sub: keyName,
    uri,
  };

  const header = {
    alg: algorithm,
    kid: keyName,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  return jwt.sign(payload, keySecret, { algorithm, header });
};

const makeApiRequest = async (authToken: string, isOAuth = false) => {
  try {
    console.log(`Making API request to: https://${requestHost}${requestPath}`);
    console.log(`Using ${isOAuth ? 'OAuth' : 'JWT'} token for authentication`);
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'CB-VERSION': '2023-04-01'
    };
    
    // Add 2FA token if provided
    const twoFactorToken = process.env.COINBASE_2FA_TOKEN;
    if (twoFactorToken) {
      console.log(`Including 2FA token: ${twoFactorToken}`);
      headers['CB-2FA-TOKEN'] = twoFactorToken;
    }
    
    const response = await fetch(`https://${requestHost}${requestPath}`, {
      method: requestMethod,
      headers
    });
    
    const data = await response.json();
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\nAPI request failed:', errorMessage);
    return { status: 500, data: { error: errorMessage } };
  }
};

const main = async () => {
  // First try using OAuth token if available
  if (accessToken) {
    console.log('Using OAuth access token');
    await makeApiRequest(accessToken, true);
    return;
  }
  
  // Fall back to JWT if OAuth token is not available
  const token = generateJWT();
  
  if (!token) {
    console.error('Failed to generate token. Check your environment variables.');
    return;
  }
  
  console.log('Generated JWT Token:');
  console.log(token);
  
//   await makeApiRequest(token, false);
};

main();
