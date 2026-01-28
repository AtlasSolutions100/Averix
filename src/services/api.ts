import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Config variables (loaded synchronously)
let projectId: string = '';
let publicAnonKey: string = '';

// Load config synchronously from window or direct import
const loadConfig = () => {
  if (!projectId || !publicAnonKey) {
    // First try window (already loaded by App.tsx)
    const windowInfo = (window as any).__supabaseInfo;
    if (windowInfo?.projectId && windowInfo?.publicAnonKey) {
      projectId = windowInfo.projectId;
      publicAnonKey = windowInfo.publicAnonKey;
    }
  }
};

// API base URL
const getAPIBase = () => {
  loadConfig();
  if (!projectId) {
    throw new Error('Supabase config not loaded. Make sure App.tsx has initialized the config.');
  }
  return `https://${projectId}.supabase.co/functions/v1/make-server-45dc47a9`;
};

// Singleton Supabase client
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    loadConfig();
    
    if (!projectId || !publicAnonKey) {
      throw new Error('Supabase configuration not available');
    }
    
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'averix-auth-token',
      },
    });
  }
  return supabaseClient;
};

// Export supabase client
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  from(table: string) {
    return getSupabaseClient().from(table);
  },
};

// Helper function to get auth headers
const getAuthHeaders = async () => {
  loadConfig();
  const { data: { session } } = await getSupabaseClient().auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`, // Use anon key for Supabase gateway
    'X-User-Token': session?.access_token || '', // Send actual user token in custom header
  };
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign up new user
  signUp: async (email: string, password: string, name: string, role: string, officeId: string) => {
    const response = await fetch(`${getAPIBase()}/auth/signup`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email, password, name, role, officeId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },

  // Get current user profile
  getMe: async () => {
    try {
      const headers = await getAuthHeaders();
      const apiBase = getAPIBase();
      
      console.log('📡 Fetching user profile from:', `${apiBase}/auth/me`);
      console.log('📡 Headers:', { 
        'Content-Type': headers['Content-Type'],
        'X-User-Token': headers['X-User-Token']?.substring(0, 20) + '...' 
      });
      
      const response = await fetch(`${apiBase}/auth/me`, {
        headers,
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch user';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
          console.error('📡 Error response:', error);
        } catch (e) {
          const text = await response.text();
          errorMsg = text || errorMsg;
          console.error('📡 Error text:', text);
        }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('✅ User profile fetched successfully');
      return data;
    } catch (error) {
      console.error('❌ getMe API error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    return session;
  },
};

// ============================================================================
// DAILY ENTRIES API
// ============================================================================

export interface DailyEntry {
  storeId: string;
  date: string;
  stops?: number;
  contacts?: number;
  presentations?: number;
  addressChecks?: number;
  creditChecks?: number;
  sales?: number;
  applications?: number;
  revenue?: number;
  hoursWorked?: number;
}

export const entriesAPI = {
  // Submit daily entry
  submit: async (entry: DailyEntry) => {
    const response = await fetch(`${getAPIBase()}/entries`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit entry');
    }
    
    return response.json();
  },

  // Get user entries
  getUserEntries: async (userId: string, options?: { startDate?: string; endDate?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const response = await fetch(`${getAPIBase()}/entries/user/${userId}?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch entries');
    }
    
    return response.json();
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  // Get office-wide analytics
  getOfficeAnalytics: async (officeId: string, options?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    
    const response = await fetch(`${getAPIBase()}/analytics/office/${officeId}?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch office analytics');
    }
    
    return response.json();
  },

  // Get leaderboard
  getLeaderboard: async (officeId: string, options?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    
    const response = await fetch(`${getAPIBase()}/analytics/leaderboard/${officeId}?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch leaderboard');
    }
    
    return response.json();
  },

  // Get store analytics
  getStoreAnalytics: async (storeId: string, options?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    
    const response = await fetch(`${getAPIBase()}/analytics/store/${storeId}?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch store analytics');
    }
    
    return response.json();
  },

  // Get store visits breakdown
  getStoreVisits: async (officeId: string, options?: { startDate?: string; endDate?: string }) => {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      
      const response = await fetch(`${getAPIBase()}/analytics/store-visits/${officeId}?${params}`, {
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch store visits';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response wasn't JSON
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get store visits API error:', error);
      throw error;
    }
  },

  // Get store performance
  getStorePerformance: async (officeId: string, options?: { startDate?: string; endDate?: string }) => {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.append('startDate', options.startDate);
      if (options?.endDate) params.append('endDate', options.endDate);
      
      const response = await fetch(`${getAPIBase()}/analytics/store-performance/${officeId}?${params}`, {
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch store performance';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response wasn't JSON
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get store performance API error:', error);
      throw error;
    }
  },
};

// ============================================================================
// STORES API
// ============================================================================

export const storesAPI = {
  // Get all stores for user's office
  getStores: async () => {
    const response = await fetch(`${getAPIBase()}/stores`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stores');
    }
    
    return response.json();
  },
};

// ============================================================================
// USERS API
// ============================================================================

export const usersAPI = {
  // Get all users in office (owner/cydcor only)
  getUsers: async (options?: { officeId?: string }) => {
    const params = new URLSearchParams();
    if (options?.officeId) params.append('officeId', options.officeId);
    
    const response = await fetch(`${getAPIBase()}/users?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    
    return response.json();
  },
};

// ============================================================================
// GOALS API
// ============================================================================

export const goalsAPI = {
  // Get office goals
  getGoals: async (officeId: string) => {
    try {
      const response = await fetch(`${getAPIBase()}/goals/${officeId}`, {
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch goals';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response wasn't JSON
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get goals API error:', error);
      throw error;
    }
  },

  // Update office goals (owner only)
  updateGoals: async (officeId: string, goals: any) => {
    try {
      const response = await fetch(`${getAPIBase()}/goals/${officeId}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(goals),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to update goals';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response wasn't JSON
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Update goals API error:', error);
      throw error;
    }
  },
};