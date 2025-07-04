// Server-side token storage singleton
// This ensures the same token store instance is used across all API routes

// Define the token interface
interface TokenData {
  accessToken: string;
  refreshToken: string;
}

// Define the global object that will store our singleton
declare global {
  var tokenStore: TokenStore | undefined;
}

// Token store class
class TokenStore {
  private tokens: Map<string, TokenData>;
  
  constructor() {
    this.tokens = new Map<string, TokenData>();
    console.log("TokenStore initialized");
  }
  
  // Store tokens for a user
  setTokens(userId: string, tokens: TokenData): void {
    console.log(`TokenStore: Storing tokens for user ${userId}`);
    this.tokens.set(userId, tokens);
    this.logState();
  }
  
  // Get tokens for a user
  getTokens(userId: string): TokenData | undefined {
    console.log(`TokenStore: Getting tokens for user ${userId}`);
    const userTokens = this.tokens.get(userId);
    console.log(`TokenStore: Tokens found for ${userId}: ${userTokens ? 'YES' : 'NO'}`);
    return userTokens;
  }
  
  // Remove tokens for a user
  removeTokens(userId: string): void {
    console.log(`TokenStore: Removing tokens for user ${userId}`);
    this.tokens.delete(userId);
  }
  
  // Log the current state of the token store
  logState(): void {
    console.log(`TokenStore: Current size: ${this.tokens.size}`);
    console.log(`TokenStore: Available keys: ${Array.from(this.tokens.keys()).join(', ')}`);
  }
}

// Create the singleton instance or use the existing one
const tokenStore = global.tokenStore || new TokenStore();

// In development, we need to ensure the instance persists across hot reloads
if (process.env.NODE_ENV === 'development') {
  global.tokenStore = tokenStore;
}

export default tokenStore;
