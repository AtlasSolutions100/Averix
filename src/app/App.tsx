import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { SignupPage } from "@/app/components/SignupPage";
import { OwnerLayout } from "@/app/components/OwnerLayout";
import { RepLayout } from "@/app/components/RepLayout";
import { Toaster } from "@/app/components/ui/sonner";
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

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Initialize config synchronously
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

        // Now check for existing session
        const { authAPI } = await import('@/services/api');
        
        try {
          const session = await authAPI.getSession();
          if (session) {
            console.log('✅ Session found, fetching user...');
            try {
              const userData = await authAPI.getMe();
              console.log('✅ User loaded:', userData.name);
              setUser(userData);
            } catch (userError: any) {
              console.error('❌ getMe API error:', userError.message);
              console.log('ℹ️ Session exists but profile fetch failed. Clearing session...');
              // Clear invalid session
              await authAPI.signOut();
            }
          } else {
            console.log('ℹ️ No active session found');
          }
        } catch (sessionError: any) {
          // Suppress expected "Invalid login credentials" error for expired/missing sessions
          if (sessionError.message?.includes('Invalid login credentials')) {
            console.log('ℹ️ No valid session (expired or not logged in)');
          } else {
            console.warn('⚠️ Session check error:', sessionError.message);
          }
          // Clear any corrupted session data
          localStorage.removeItem('veridex-auth-token');
        }
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAndCheckSession();
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
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            {/* Neon RGB animated spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00D9FF] animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-[#7C5CFA] animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#FF006E] animate-spin" style={{ animationDelay: '0.3s', animationDuration: '2s' }}></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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