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

// CRITICAL: Use window as the SINGLE SOURCE OF TRUTH for the Supabase client
// This prevents multiple instances across hot reloads and module re-imports
const getSupabaseClient = (): SupabaseClient => {
  // ALWAYS check window first - it's the single source of truth
  if (typeof window !== 'undefined' && (window as any).__veridexSupabaseClient) {
    return (window as any).__veridexSupabaseClient;
  }
  
  // Only create if it doesn't exist in window
  loadConfig();
  
  if (!projectId || !publicAnonKey) {
    throw new Error('Supabase configuration not available');
  }
  
  console.log('🔧 Creating NEW Supabase client (should only happen ONCE per page load)');
  
  const supabaseUrl = `https://${projectId}.supabase.co`;
  const client = createClient(
    supabaseUrl,
    publicAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: window.localStorage,
        storageKey: 'veridex-auth-token',
      },
    });
    
  // IMMEDIATELY store in window before returning
  if (typeof window !== 'undefined') {
    (window as any).__veridexSupabaseClient = client;
  }
    
  console.log('✅ Supabase client created and stored in window.__veridexSupabaseClient');
  return client;
};

// Export supabase client as proxy that always gets from window
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  from(table: string) {
    return getSupabaseClient().from(table);
  },
};

// Helper function to get auth headers (used for API requests)
const getAuthHeaders = async () => {
  loadConfig();
  
  console.log('🔐 Getting auth headers...');
  
  try {
    // First try to get the session
    const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session for auth headers:', sessionError);
      throw new Error('Failed to get authentication session');
    }
    
    if (!session || !session.access_token) {
      console.error('❌ No session or access token available');
      console.error('   Session:', session);
      
      // Try to refresh the session one more time
      console.log('🔄 Attempting to refresh session...');
      const { data: { session: refreshedSession }, error: refreshError } = await getSupabaseClient().auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        console.error('❌ Session refresh failed:', refreshError);
        // Clear the session storage to force re-login
        localStorage.removeItem('veridex-auth-token');
        throw new Error('Session expired, user needs to log in again');
      }
      
      console.log('✅ Session refreshed successfully');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': refreshedSession.access_token,
      };
    }
    
    console.log('✅ Session found, access token length:', session.access_token.length);
    console.log('   Token preview:', session.access_token.substring(0, 30) + '...');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`, // Use anon key for Supabase gateway
      'X-User-Token': session.access_token, // Send actual user token in custom header
    };
  } catch (error: any) {
    // Handle abort errors gracefully
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.log('ℹ️ Session fetch was aborted (component unmounted or navigation occurred)');
      throw new Error('Request aborted');
    }
    throw error;
  }
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================
// Cache bust: 2026-02-03-v3

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
  signUp: async (email: string, password: string, name: string, role: string, officeIdOrName: string) => {
    loadConfig(); // Ensure config is loaded
    
    const payload: any = { email, password, name, role };
    
    // If owner, pass officeName; if rep, pass officeId
    if (role === 'owner') {
      payload.officeName = officeIdOrName;
    } else {
      payload.officeId = officeIdOrName;
    }
    
    console.log('🚀 Signup request payload:', { ...payload, password: '***' });
    
    const response = await fetch(`${getAPIBase()}/auth/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`, // Required for Supabase gateway
      },
      body: JSON.stringify(payload),
    });
    
    console.log('📡 Signup response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Signup failed';
      try {
        const error = await response.json();
        console.error('❌ Signup error from server:', error);
        errorMessage = error.error || errorMessage;
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        const text = await response.text();
        console.error('❌ Raw error response:', text);
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Signup successful:', result);
    return result;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user (alias for getCurrentUser)
  getMe: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getAPIBase()}/auth/me`, {
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Get current user
  getCurrentUser: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getAPIBase()}/auth/me`, {
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Sign out
  signOut: async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getAPIBase()}/auth/change-password`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }
    
    return response.json();
  },
  
  // Reset rep password (owner only)
  resetRepPassword: async (repId: string, newPassword: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${getAPIBase()}/auth/reset-rep-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ repId, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }
    
    return response.json();
  },
};

// ============================================================================
// DAILY ENTRIES API (OFFICIAL SUBMISSIONS - ONE PER DAY)
// ============================================================================

export interface DailyEntry {
  storeId: string;
  date: string;
  stops: number;
  contacts: number;
  presentations: number;
  addressChecks: number;
  creditChecks: number;
  sales: number;
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

  // Get all entries for an office (owner view)
  getEntries: async (officeId: string, options?: { startDate?: string; endDate?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const response = await fetch(`${getAPIBase()}/entries/office/${officeId}?${params}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch entries');
    }
    
    return response.json();
  },

  // Delete entry (owner only)
  deleteEntry: async (entryId: string) => {
    const response = await fetch(`${getAPIBase()}/entries/${entryId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete entry');
    }
    
    return response.json();
  },
};

// ============================================================================
// LIVE TRACKER PROGRESS API (DRAFTS - NOT OFFICIAL SUBMISSIONS)
// ============================================================================

export interface TrackerProgress {
  date: string;
  storeId?: string;
  contacts: number;
  stops: number;
  presentations: number;
  addressChecks: number;
  creditChecks: number;
  sales: number;
  products: number;
}

export const trackerAPI = {
  // Save/update live tracker progress (auto-save)
  saveProgress: async (progress: TrackerProgress) => {
    const response = await fetch(`${getAPIBase()}/tracker/progress`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(progress),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save tracker progress');
    }
    
    return response.json();
  },

  // Get today's tracker progress
  getProgress: async (date: string) => {
    const response = await fetch(`${getAPIBase()}/tracker/progress/${date}`, {
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load tracker progress');
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

  // Create store (owner only)
  createStore: async (store: { name: string; brand?: string; location?: string }) => {
    const response = await fetch(`${getAPIBase()}/stores`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(store),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create store');
    }
    
    return response.json();
  },

  // Update store (owner only)
  updateStore: async (storeId: string, updates: { name?: string; brand?: string; location?: string }) => {
    const response = await fetch(`${getAPIBase()}/stores/${storeId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update store');
    }
    
    return response.json();
  },

  // Delete store (owner only)
  deleteStore: async (storeId: string) => {
    const response = await fetch(`${getAPIBase()}/stores/${storeId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete store');
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

  // Create rep (owner only)
  createRep: async (rep: { email: string; password: string; name: string }) => {
    const response = await fetch(`${getAPIBase()}/users/create-rep`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(rep),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create rep');
    }
    
    return response.json();
  },

  // Update user (owner only)
  updateUser: async (userId: string, updates: { name?: string; email?: string }) => {
    const response = await fetch(`${getAPIBase()}/users/${userId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    
    return response.json();
  },

  // Delete user (owner only)
  deleteUser: async (userId: string) => {
    const response = await fetch(`${getAPIBase()}/users/${userId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    
    return response.json();
  },
};

// ============================================================================
// OFFICE API
// ============================================================================

export const officeAPI = {
  // Update office name (owner only)
  updateOffice: async (officeId: string, updates: { name: string }) => {
    const response = await fetch(`${getAPIBase()}/offices/${officeId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update office');
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

  // Create a new goal
  createGoal: async (goal: any) => {
    try {
      const response = await fetch(`${getAPIBase()}/goals`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(goal),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to create goal';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Create goal API error:', error);
      throw error;
    }
  },

  // Delete a goal
  deleteGoal: async (goalId: string) => {
    try {
      const response = await fetch(`${getAPIBase()}/goals/${goalId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to delete goal';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    } catch (error) {
      console.error('Delete goal API error:', error);
      throw error;
    }
  },
};