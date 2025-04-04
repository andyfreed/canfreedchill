import { createClient } from '@supabase/supabase-js';

// Simple mock client that does nothing
const mockClient = {
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  }),
  auth: {
    getSession: () => ({ data: { session: null }, error: null }),
    signOut: () => ({ error: null })
  }
};

// Export the mock client
export const supabase = mockClient;