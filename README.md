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
```

### Installation and Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Access Requirements

- **Vercel**: Request access to the `bedrock` Vercel project
- **Supabase**: Request access to the `bedrock-prod` Supabase project
- **Dynamic**: Request access to the `bedrock` Dynamic project

### Deployment Process

1. **Environment Variables**: Already configured in Vercel project settings
   - Set up production environment variables locally by copying the content of Settings > Environment Variables and pasting it into an `.env` file.

2. **Continuous Deployment**:
   - Pushing to the `main` branch automatically triggers deployment
   - Run `npm run build` locally before pushing to catch any linting errors
   - Failed builds will prevent deployment on Vercel
