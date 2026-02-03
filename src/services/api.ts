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
    supabaseClient = createClient(
      supabaseUrl,
      publicAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: 'veridex-auth-token',
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
  
  console.log('🔐 Getting auth headers...');
  const { data: { session }, error } = await getSupabaseClient().auth.getSession();
  
  if (error) {
    console.error('❌ Error getting session for auth headers:', error);
    throw new Error('Failed to get authentication session');
  }
  
  if (!session || !session.access_token) {
    console.error('❌ No session or access token available');
    console.error('   Session:', session);
    throw new Error('No active session. Please log in again.');
  }
  
  console.log('✅ Session found, access token length:', session.access_token.length);
  console.log('   Token preview:', session.access_token.substring(0, 30) + '...');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`, // Use anon key for Supabase gateway
    'X-User-Token': session.access_token, // Send actual user token in custom header
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
  signUp: async (email: string, password: string, name: string, role: string, officeIdOrName: string) => {
    const payload: any = { email, password, name, role };
    
    // If owner, pass officeName; if rep, pass officeId
    if (role === 'owner') {
      payload.officeName = officeIdOrName;
    } else {
      payload.officeId = officeIdOrName;
    }
    
    // Signup doesn't require authentication, just basic headers
    loadConfig();
    const response = await fetch(`${getAPIBase()}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`, // Use anon key for Supabase gateway
      },
      body: JSON.stringify(payload),
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