import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { SignupPage } from "@/app/components/SignupPage";
import { OwnerLayout } from "@/app/components/OwnerLayout";
import { RepLayout } from "@/app/components/RepLayout";
import { Toaster } from "@/app/components/ui/sonner";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useFavicon } from "@/hooks/useFavicon";

export type UserRole = "owner" | "rep" | "cydcor";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  officeId: string;
  officeName: string;
  avatar?: string;
}

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">!</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// v3.1
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;
    
    // Save original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to suppress AbortError
    console.error = (...args: any[]) => {
      // Check if this is an AbortError
      const isAbortError = args.some((arg) => {
        if (arg instanceof Error) {
          return arg.name === 'AbortError' || arg.message?.includes('aborted');
        }
        if (typeof arg === 'string') {
          return arg.includes('AbortError') || arg.includes('aborted');
        }
        if (arg?.name === 'AbortError') {
          return true;
        }
        return false;
      });
      
      // If it's an AbortError, suppress it
      if (isAbortError) {
        console.log('ℹ️ Suppressed AbortError from console (operation was cancelled, this is normal)');
        return;
      }
      
      // Otherwise, call original console.error
      originalConsoleError.apply(console, args);
    };
    
    // Global error handler to suppress AbortErrors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.name === 'AbortError' || event.reason?.message?.includes('aborted')) {
        // Suppress AbortError from showing in console
        event.preventDefault();
        console.log('ℹ️ Suppressed AbortError (operation was cancelled, this is normal)');
      }
    };
    
    // Global error event handler
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'AbortError' || event.message?.includes('AbortError') || event.message?.includes('aborted')) {
        event.preventDefault();
        console.log('ℹ️ Suppressed AbortError (operation was cancelled, this is normal)');
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    const initAndCheckSession = async () => {
      try {
        // Load Supabase config first
        const { projectId, publicAnonKey } = await import('/utils/supabase/info');
        
        // Store in window for API to use
        (window as any).__supabaseInfo = {
          projectId,
          publicAnonKey,
        };
        
        console.log('✅ Config loaded:', { projectId, hasKey: !!publicAnonKey });

        // Small delay to ensure config is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if still mounted
        if (!isMounted) return;

        // Test server health
        try {
          const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-45dc47a9/health`;
          console.log('🏥 Testing server health:', healthUrl);
          
          const healthResponse = await fetch(healthUrl, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          });
          
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Server is healthy:', healthData);
          } else {
            console.warn('⚠️ Server health check failed:', healthResponse.status, healthResponse.statusText);
          }
        } catch (healthError) {
          console.warn('⚠️ Server health check error (this is OK if server not deployed yet):', healthError);
        }

        // Check if still mounted after health check
        if (!isMounted) return;

        // Now import the API
        const { authAPI, supabase } = await import('@/services/api');
        
        // Check if still mounted before setting up listener
        if (!isMounted) return;
        
        // Set up auth state listener - this will handle all session changes
        try {
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Skip if component unmounted
            if (!isMounted) return;
            
            console.log('🔔 Auth state changed:', event, session ? 'Session exists' : 'No session');
            
            if (event === 'SIGNED_OUT') {
              console.log('🚪 User signed out');
              if (isMounted) {
                setUser(null);
                setIsLoading(false);
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔄 Token refreshed successfully');
            } else if (event === 'SIGNED_IN' && session) {
              console.log('✅ User signed in, fetching profile...');
              // Check if we already have user data (from LoginPage callback)
              // If so, we don't need to fetch again
              if (isMounted) {
                try {
                  const userData = await authAPI.getMe();
                  setUser(userData);
                  setIsLoading(false);
                } catch (error: any) {
                  // Handle abort errors silently
                  if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('Request aborted')) {
                    console.log('ℹ️ Profile fetch aborted (component unmounted)');
                  } else {
                    console.error('❌ Failed to fetch user after sign in:', error);
                    console.log('ℹ️ User will be set via onLogin callback instead');
                  }
                  if (isMounted) setIsLoading(false);
                }
              }
            } else if (event === 'INITIAL_SESSION' && session) {
              console.log('📋 Initial session found, fetching user...');
              try {
                const userData = await authAPI.getMe();
                console.log('✅ User loaded:', userData.name);
                if (isMounted) {
                  setUser(userData);
                  setIsLoading(false);
                }
              } catch (userError: any) {
                // Handle abort errors silently
                if (userError.name === 'AbortError' || userError.message?.includes('aborted') || userError.message?.includes('Request aborted')) {
                  console.log('ℹ️ Profile fetch aborted (component unmounted)');
                  if (isMounted) setIsLoading(false);
                } else {
                  console.error('❌ getMe API error:', userError.message);
                  console.log('ℹ️ Session exists but profile fetch failed. Clearing session...');
                  // Clear invalid session
                  try {
                    await authAPI.signOut();
                  } catch (e: any) {
                    if (e.name !== 'AbortError' && !e.message?.includes('aborted')) {
                      console.error('Sign out error:', e);
                    }
                  }
                  if (isMounted) setIsLoading(false);
                }
              }
            } else if (event === 'INITIAL_SESSION' && !session) {
              console.log('ℹ️ No initial session found');
              if (isMounted) setIsLoading(false);
            }
          });
          
          subscription = authSubscription;
        } catch (authError: any) {
          // Catch any errors from setting up the auth listener
          if (authError.name === 'AbortError' || authError.message?.includes('aborted')) {
            console.log('ℹ️ Auth listener setup aborted (component unmounted)');
          } else {
            console.error('❌ Failed to set up auth listener:', authError);
          }
          if (isMounted) setIsLoading(false);
        }
        
      } catch (error: any) {
        // Handle abort errors gracefully
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
          console.log('ℹ️ Initialization was aborted (component unmounted)');
        } else {
          console.error('❌ Initialization failed:', error);
        }
        if (isMounted) setIsLoading(false);
      }
    };

    initAndCheckSession();
    
    // Cleanup function
    return () => {
      console.log('🧹 App unmounting, cleaning up auth listener');
      isMounted = false;
      
      // Restore original console.error
      console.error = originalConsoleError;
      
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e: any) {
          if (e.name !== 'AbortError' && !e.message?.includes('aborted')) {
            console.log('Note: Error unsubscribing (this is OK):', e);
          }
        }
      }
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const { authAPI } = await import('@/services/api');
      await authAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return (
      <>
        {showSignup ? (
          <SignupPage 
            onSignup={handleLogin} 
            onBackToLogin={() => setShowSignup(false)} 
          />
        ) : (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setShowSignup(true)} 
          />
        )}
        <Toaster />
      </>
    );
  }

  // Route based on user role
  if (user.role === "owner" || user.role === "cydcor") {
    return (
      <>
        <OwnerLayout user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <RepLayout user={user} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}

export default function App() {
  // Set favicon for the entire app
  useFavicon();
  
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}