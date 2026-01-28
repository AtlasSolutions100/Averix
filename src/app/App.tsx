import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { OwnerLayout } from "@/app/components/OwnerLayout";
import { RepLayout } from "@/app/components/RepLayout";
import { Toaster } from "@/app/components/ui/sonner";

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
        
        const session = await authAPI.getSession();
        if (session) {
          console.log('✅ Session found, fetching user...');
          try {
            const userData = await authAPI.getMe();
            console.log('✅ User loaded:', userData.name);
            setUser(userData);
          } catch (userError: any) {
            console.error('❌ Failed to load user profile:', userError.message);
            // Clear invalid session
            await authAPI.signOut();
          }
        } else {
          console.log('ℹ️ No active session found (user needs to log in)');
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
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
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
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}