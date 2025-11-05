import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication optional
export const base44 = createClient({
  appId: "68fcd301afef087bf759dba3", 
  requiresAuth: false // Allow public API calls without authentication
});
