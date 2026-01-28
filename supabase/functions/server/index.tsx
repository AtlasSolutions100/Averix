import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kvStore from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase clients
const getSupabaseClient = (authToken?: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = authToken ? Deno.env.get('SUPABASE_ANON_KEY')! : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey, authToken ? {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  } : {});
};

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  // Read token from custom header (not Authorization to avoid Supabase gateway validation)
  const token = c.req.header('X-User-Token');
  
  if (!token) {
    console.error('❌ No token provided in X-User-Token header');
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    // Decode JWT without validation (for demo/development)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid token format - expected 3 parts, got:', parts.length);
      return c.json({ error: 'Invalid token format' }, 401);
    }
    
    // Decode base64url to base64
    let base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode base64
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);
    
    console.log('✅ Token decoded successfully. User ID:', payload.sub);
    
    // Set user from JWT payload (sub = user id)
    c.set('user', { 
      id: payload.sub,
      email: payload.email || ''
    });
    c.set('token', token);
  } catch (e) {
    console.error('❌ Token decode error:', e);
    return c.json({ error: 'Invalid token', details: String(e) }, 401);
  }
  
  await next();
};

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get("/make-server-45dc47a9/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// Sign up new user
app.post("/make-server-45dc47a9/auth/signup", async (c) => {
  try {
    const { email, password, name, role, officeId, officeName } = await c.req.json();
    
    const supabase = getSupabaseClient();
    
    let finalOfficeId = officeId;
    
    // If user is an owner and no officeId provided, create a new office
    if (role === 'owner' && !officeId) {
      const newOfficeName = officeName || `${name}'s Office`;
      console.log(`Creating new office: ${newOfficeName}`);
      
      const { data: newOffice, error: officeError } = await supabase
        .from('offices')
        .insert({ name: newOfficeName })
        .select()
        .single();
      
      if (officeError) {
        console.error('Office creation error:', officeError);
        return c.json({ error: officeError.message }, 400);
      }
      
      finalOfficeId = newOffice.id;
      console.log(`✅ Created office: ${newOfficeName} (${finalOfficeId})`);
    }
    
    // Validate we have an office_id
    if (!finalOfficeId) {
      return c.json({ error: 'Office ID required. Owners must provide office name, reps must provide office ID.' }, 400);
    }
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since we don't have email server
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        office_id: finalOfficeId,
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      return c.json({ error: profileError.message }, 400);
    }
    
    console.log(`✅ Created user: ${name} (${role}) in office ${finalOfficeId}`);
    
    return c.json({ user: profile, officeId: finalOfficeId });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get current user profile
app.get("/make-server-45dc47a9/auth/me", async (c) => {
  try {
    // Read token from custom header to avoid Supabase's JWT validation
    const token = c.req.header('X-User-Token');
    
    if (!token) {
      console.error('❌ No token in auth/me request');
      return c.json({ error: 'No authentication token provided. Please log in again.' }, 401);
    }
    
    console.log('🔍 Received auth/me request, token length:', token.length);
    
    // Decode JWT without validation
    let userId;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const payload = JSON.parse(atob(base64));
        userId = payload.sub;
        console.log('✅ Decoded user ID from token:', userId);
      } else {
        console.error('❌ Token has wrong number of parts:', parts.length);
        return c.json({ error: 'Invalid token format. Please log in again.' }, 401);
      }
    } catch (e) {
      console.error('❌ Failed to decode token:', e);
      return c.json({ error: 'Failed to decode authentication token. Please log in again.' }, 401);
    }
    
    if (!userId) {
      console.error('❌ No user ID extracted from token');
      return c.json({ error: 'No user ID in token. Please log in again.' }, 401);
    }
    
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    
    console.log('🔍 Fetching profile for user ID:', userId);
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*, offices(name)')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Database error fetching profile:', error.message);
      return c.json({ error: `Database error: ${error.message}` }, 400);
    }
    
    if (!profile) {
      console.error('❌ No profile found for user ID:', userId);
      return c.json({ 
        error: 'User profile not found. Your account may not be set up correctly. Please contact support.' 
      }, 404);
    }
    
    console.log('✅ Successfully fetched profile for:', profile.email, '(role:', profile.role, ')');
    
    return c.json({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      officeId: profile.office_id,
      officeName: profile.offices?.name || 'Unknown Office',
      avatar: profile.avatar,
    });
  } catch (error) {
    console.error('❌ Unexpected error in auth/me:', error);
    return c.json({ error: 'Internal server error. Please try again later.' }, 500);
  }
});

// ============================================================================
// DAILY ENTRIES ENDPOINTS
// ============================================================================

// Submit daily entry
app.post("/make-server-45dc47a9/entries", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const entry = await c.req.json();
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    
    // Get user's office_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('office_id')
      .eq('id', user.id)
      .single();
    
    const { data, error } = await supabase
      .from('daily_entries')
      .upsert({
        user_id: user.id,
        office_id: profile.office_id,
        store_id: entry.storeId,
        entry_date: entry.date,
        stops: entry.stops || 0,
        contacts: entry.contacts || 0,
        presentations: entry.presentations || 0,
        address_checks: entry.addressChecks || 0,
        credit_checks: entry.creditChecks || 0,
        sales: entry.sales || 0,
        applications: entry.applications || 0,
        revenue: entry.revenue || 0,
        hours_worked: entry.hoursWorked || 0,
      }, {
        onConflict: 'user_id,entry_date,store_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Entry submission error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ entry: data });
  } catch (error) {
    console.error('Submit entry error:', error);
    return c.json({ error: 'Internal server error submitting entry' }, 500);
  }
});

// Get user's entries
app.get("/make-server-45dc47a9/entries/user/:userId", requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    const { startDate, endDate, limit = '50' } = c.req.query();
    
    let query = supabase
      .from('daily_entries')
      .select('*, stores(name, brand)')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(parseInt(limit));
    
    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Fetch entries error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ entries: data });
  } catch (error) {
    console.error('Get entries error:', error);
    return c.json({ error: 'Internal server error fetching entries' }, 500);
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get office-wide analytics
app.get("/make-server-45dc47a9/analytics/office/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    const { startDate, endDate } = c.req.query();
    
    let query = supabase
      .from('daily_entries')
      .select('*')
      .eq('office_id', officeId);
    
    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Analytics fetch error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Calculate aggregated metrics
    const totals = entries.reduce((acc, entry) => ({
      stops: acc.stops + (entry.stops || 0),
      contacts: acc.contacts + (entry.contacts || 0),
      presentations: acc.presentations + (entry.presentations || 0),
      addressChecks: acc.addressChecks + (entry.address_checks || 0),
      creditChecks: acc.creditChecks + (entry.credit_checks || 0),
      sales: acc.sales + (entry.sales || 0),
      applications: acc.applications + (entry.applications || 0),
      revenue: acc.revenue + parseFloat(entry.revenue || 0),
    }), {
      stops: 0,
      contacts: 0,
      presentations: 0,
      addressChecks: 0,
      creditChecks: 0,
      sales: 0,
      applications: 0,
      revenue: 0,
    });
    
    // Calculate rates
    const metrics = {
      ...totals,
      contactRate: totals.stops > 0 ? (totals.contacts / totals.stops * 100).toFixed(1) : 0,
      presentationRate: totals.contacts > 0 ? (totals.presentations / totals.contacts * 100).toFixed(1) : 0,
      closeRate: totals.contacts > 0 ? (totals.sales / totals.contacts * 100).toFixed(1) : 0,
      revenuePerContact: totals.contacts > 0 ? (totals.revenue / totals.contacts).toFixed(2) : 0,
    };
    
    return c.json({ metrics, entryCount: entries.length });
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Internal server error generating analytics' }, 500);
  }
});

// Get rep leaderboard
app.get("/make-server-45dc47a9/analytics/leaderboard/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    const { startDate, endDate } = c.req.query();
    
    // Get all entries for the office
    let query = supabase
      .from('daily_entries')
      .select('*, user_profiles(name)')
      .eq('office_id', officeId);
    
    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Leaderboard fetch error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Group by user and calculate totals
    const repStats = entries.reduce((acc: any, entry: any) => {
      const userId = entry.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          name: entry.user_profiles?.name || 'Unknown',
          contacts: 0,
          presentations: 0,
          sales: 0,
          revenue: 0,
        };
      }
      
      acc[userId].contacts += entry.contacts || 0;
      acc[userId].presentations += entry.presentations || 0;
      acc[userId].sales += entry.sales || 0;
      acc[userId].revenue += parseFloat(entry.revenue || 0);
      
      return acc;
    }, {});
    
    // Convert to array and calculate metrics
    const leaderboard = Object.values(repStats).map((rep: any) => ({
      ...rep,
      closeRate: rep.contacts > 0 ? ((rep.sales / rep.contacts) * 100).toFixed(1) : '0.0',
      revenuePerContact: rep.contacts > 0 ? (rep.revenue / rep.contacts).toFixed(2) : '0.00',
    })).sort((a: any, b: any) => b.sales - a.sales);
    
    return c.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return c.json({ error: 'Internal server error generating leaderboard' }, 500);
  }
});

// Get store performance
app.get("/make-server-45dc47a9/analytics/store/:storeId", requireAuth, async (c) => {
  try {
    const storeId = c.req.param('storeId');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    const { startDate, endDate } = c.req.query();
    
    let query = supabase
      .from('daily_entries')
      .select('*')
      .eq('store_id', storeId);
    
    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Store analytics error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Calculate totals
    const totals = entries.reduce((acc, entry) => ({
      contacts: acc.contacts + (entry.contacts || 0),
      sales: acc.sales + (entry.sales || 0),
      revenue: acc.revenue + parseFloat(entry.revenue || 0),
    }), { contacts: 0, sales: 0, revenue: 0 });
    
    return c.json({ 
      storeId,
      ...totals,
      entryCount: entries.length,
      avgSalesPerDay: entries.length > 0 ? (totals.sales / entries.length).toFixed(1) : '0.0',
    });
  } catch (error) {
    console.error('Store analytics error:', error);
    return c.json({ error: 'Internal server error generating store analytics' }, 500);
  }
});

// ============================================================================
// STORE VISITS & PERFORMANCE ENDPOINTS
// ============================================================================

// Get store visits breakdown (stores x reps matrix)
app.get("/make-server-45dc47a9/analytics/store-visits/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    const supabase = getSupabaseClient();
    const { startDate, endDate } = c.req.query();
    
    // Get all daily entries with user and store info
    let query = supabase
      .from('daily_entries')
      .select(`
        *,
        stores(id, name, location, brand),
        user_profiles(id, name)
      `)
      .eq('office_id', officeId);
    
    if (startDate) query = query.gte('entry_date', startDate);
    if (endDate) query = query.lte('entry_date', endDate);
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('Store visits error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Format for store visits view
    const storeVisits = entries.map(entry => ({
      storeId: entry.stores?.id,
      storeName: entry.stores?.name || 'Unknown Store',
      storeLocation: entry.stores?.location || '',
      repId: entry.user_profiles?.id,
      repName: entry.user_profiles?.name || 'Unknown Rep',
      sales: entry.sales || 0,
      revenue: parseFloat(entry.revenue || 0),
      date: entry.entry_date,
    }));
    
    return c.json({ storeVisits });
  } catch (error) {
    console.error('Store visits error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get store performance summary
app.get("/make-server-45dc47a9/analytics/store-performance/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    const supabase = getSupabaseClient();
    const { startDate, endDate } = c.req.query();
    
    // Get all stores for office
    const { data: stores } = await supabase
      .from('stores')
      .select('*')
      .eq('office_id', officeId)
      .eq('is_active', true);
    
    // Get entries for each store
    let entriesQuery = supabase
      .from('daily_entries')
      .select('*, user_profiles(id)')
      .eq('office_id', officeId);
    
    if (startDate) entriesQuery = entriesQuery.gte('entry_date', startDate);
    if (endDate) entriesQuery = entriesQuery.lte('entry_date', endDate);
    
    const { data: entries, error } = await entriesQuery;
    
    if (error) {
      console.error('Store performance error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Group by store
    const storeMap = new Map();
    
    entries?.forEach(entry => {
      const storeId = entry.store_id;
      if (!storeMap.has(storeId)) {
        const store = stores?.find(s => s.id === storeId);
        storeMap.set(storeId, {
          storeId,
          storeName: store?.name || 'Unknown',
          storeLocation: store?.location || '',
          totalContacts: 0,
          totalSales: 0,
          totalRevenue: 0,
          activeReps: new Set(),
        });
      }
      
      const store = storeMap.get(storeId);
      store.totalContacts += entry.contacts || 0;
      store.totalSales += entry.sales || 0;
      store.totalRevenue += parseFloat(entry.revenue || 0);
      if (entry.user_profiles?.id) {
        store.activeReps.add(entry.user_profiles.id);
      }
    });
    
    // Convert to array
    const storePerformance = Array.from(storeMap.values()).map(store => ({
      ...store,
      activeReps: store.activeReps.size,
    }));
    
    return c.json({ storePerformance });
  } catch (error) {
    console.error('Store performance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// GOALS ENDPOINTS
// ============================================================================

// Get goals for office
app.get("/make-server-45dc47a9/goals/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    const goals = await kvStore.get(`goals_array:${officeId}`);
    
    return c.json({ 
      goals: goals || []
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update goals for office (owner only)
app.put("/make-server-45dc47a9/goals/:officeId", requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    const user = c.get('user');
    const supabase = getSupabaseClient();
    
    // Verify user is owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can set goals' }, 403);
    }
    
    const goals = await c.req.json();
    await kvStore.set(`goals:${officeId}`, goals);
    
    return c.json({ success: true, goals });
  } catch (error) {
    console.error('Update goals error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create a new goal
app.post("/make-server-45dc47a9/goals", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const goalData = await c.req.json();
    
    // Verify user is owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can create goals' }, 403);
    }
    
    // Get existing goals array
    const existingGoals = await kvStore.get(`goals_array:${goalData.officeId}`) || [];
    
    // Create new goal with ID
    const newGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...goalData,
      current: 0,
      createdAt: new Date().toISOString(),
    };
    
    // Add to array
    const updatedGoals = [...existingGoals, newGoal];
    await kvStore.set(`goals_array:${goalData.officeId}`, updatedGoals);
    
    return c.json({ success: true, goal: newGoal });
  } catch (error) {
    console.error('Create goal error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete a goal
app.delete("/make-server-45dc47a9/goals/:goalId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const goalId = c.req.param('goalId');
    
    // Verify user is owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can delete goals' }, 403);
    }
    
    // Get existing goals array
    const existingGoals = await kvStore.get(`goals_array:${profile.office_id}`) || [];
    
    // Filter out the deleted goal
    const updatedGoals = existingGoals.filter((g: any) => g.id !== goalId);
    await kvStore.set(`goals_array:${profile.office_id}`, updatedGoals);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// STORES ENDPOINTS
// ============================================================================

// Get stores for office
app.get("/make-server-45dc47a9/stores", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    
    // Get user's office
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('office_id')
      .eq('id', user.id)
      .single();
    
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('office_id', profile.office_id)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Stores fetch error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    return c.json({ error: 'Internal server error fetching stores' }, 500);
  }
});

// Create store (owner only)
app.post("/make-server-45dc47a9/stores", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const { name, brand, location } = await c.req.json();
    
    // Get user's profile to verify role and office
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can create stores
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can create stores' }, 403);
    }
    
    // Create store
    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        office_id: profile.office_id,
        name,
        brand,
        location,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Store creation error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    console.log(`✅ Created store: ${name} in office ${profile.office_id}`);
    return c.json({ store });
  } catch (error) {
    console.error('Create store error:', error);
    return c.json({ error: 'Internal server error creating store' }, 500);
  }
});

// Update store (owner only)
app.put("/make-server-45dc47a9/stores/:storeId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const storeId = c.req.param('storeId');
    const updates = await c.req.json();
    
    // Get user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can update stores
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can update stores' }, 403);
    }
    
    // Update store (only if it belongs to user's office)
    const { data: store, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .eq('office_id', profile.office_id)
      .select()
      .single();
    
    if (error) {
      console.error('Store update error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ store });
  } catch (error) {
    console.error('Update store error:', error);
    return c.json({ error: 'Internal server error updating store' }, 500);
  }
});

// Delete/deactivate store (owner only)
app.delete("/make-server-45dc47a9/stores/:storeId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const storeId = c.req.param('storeId');
    
    // Get user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can delete stores
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can delete stores' }, 403);
    }
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('stores')
      .update({ is_active: false })
      .eq('id', storeId)
      .eq('office_id', profile.office_id);
    
    if (error) {
      console.error('Store delete error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete store error:', error);
    return c.json({ error: 'Internal server error deleting store' }, 500);
  }
});

// ============================================================================
// USERS ENDPOINTS
// ============================================================================

// Get users in office
app.get("/make-server-45dc47a9/users", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    // Use SERVICE_ROLE_KEY to bypass RLS policies
    const supabase = getSupabaseClient();
    
    // Get user's office
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('office_id, role')
      .eq('id', user.id)
      .single();
    
    // Only owners and cydcor admins can view all users
    if (profile.role !== 'owner' && profile.role !== 'cydcor') {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('office_id', profile.office_id)
      .order('name');
    
    if (error) {
      console.error('Users fetch error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Internal server error fetching users' }, 500);
  }
});

// Create rep (owner only)
app.post("/make-server-45dc47a9/users/create-rep", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const { email, password, name } = await c.req.json();
    
    // Get user's profile to verify role and office
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can create reps
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can create rep accounts' }, 403);
    }
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since we don't have email server
    });
    
    if (authError) {
      console.error('Auth error creating rep:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Create user profile as rep in owner's office
    const { data: repProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'rep',
        office_id: profile.office_id,
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      return c.json({ error: profileError.message }, 400);
    }
    
    console.log(`✅ Created rep: ${name} in office ${profile.office_id}`);
    
    return c.json({ 
      rep: repProfile,
      credentials: { email, password } // Return credentials so owner can share with rep
    });
  } catch (error) {
    console.error('Create rep error:', error);
    return c.json({ error: 'Internal server error creating rep' }, 500);
  }
});

// Update user (owner only - for editing rep details)
app.put("/make-server-45dc47a9/users/:userId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    // Get requesting user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can update users
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can update users' }, 403);
    }
    
    // Update user (only if they belong to same office)
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .eq('office_id', profile.office_id)
      .select()
      .single();
    
    if (error) {
      console.error('User update error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Internal server error updating user' }, 500);
  }
});

// Delete/deactivate user (owner only)
app.delete("/make-server-45dc47a9/users/:userId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient();
    const userId = c.req.param('userId');
    
    // Get requesting user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, office_id')
      .eq('id', user.id)
      .single();
    
    // Only owners can delete users
    if (profile?.role !== 'owner' && profile?.role !== 'cydcor') {
      return c.json({ error: 'Only owners can delete users' }, 403);
    }
    
    // Get the user to be deleted to verify they're in the same office
    const { data: userToDelete } = await supabase
      .from('user_profiles')
      .select('office_id, role')
      .eq('id', userId)
      .single();
    
    if (userToDelete?.office_id !== profile.office_id) {
      return c.json({ error: 'Cannot delete users from other offices' }, 403);
    }
    
    // Don't allow deleting other owners
    if (userToDelete?.role === 'owner' || userToDelete?.role === 'cydcor') {
      return c.json({ error: 'Cannot delete owner accounts' }, 403);
    }
    
    // Delete user profile (cascade will handle daily_entries)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('User delete error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Also delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.warn('Auth delete warning (user profile already deleted):', authError);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Internal server error deleting user' }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================
Deno.serve(app.fetch);