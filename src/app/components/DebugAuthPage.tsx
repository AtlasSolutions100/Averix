import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { authAPI, supabase } from "@/services/api";

export function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testFullFlow = async () => {
    setLogs([]);
    setIsLoading(true);
    addLog("🚀 Starting authentication debug test...");

    try {
      // Get config from window
      const config = (window as any).__supabaseInfo;
      const projectId = config?.projectId;
      const publicAnonKey = config?.publicAnonKey;
      
      if (!projectId || !publicAnonKey) {
        addLog("❌ Supabase configuration not found in window");
        return;
      }
      
      // Step 1: Check Supabase connection
      addLog("Step 1: Checking Supabase connection...");
      addLog(`Project ID: ${projectId}`);
      addLog(`Anon Key (first 50 chars): ${publicAnonKey.substring(0, 50)}...`);
      addLog(`API URL: https://${projectId}.supabase.co/functions/v1/make-server-45dc47a9`);

      // Step 2: Test health endpoint
      addLog("\nStep 2: Testing health endpoint...");
      try {
        const healthResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-45dc47a9/health`
        );
        const healthData = await healthResponse.json();
        addLog(`✅ Health check: ${JSON.stringify(healthData)}`);
      } catch (err: any) {
        addLog(`❌ Health check failed: ${err.message}`);
        return;
      }

      // Step 3: Test sign in
      addLog("\nStep 3: Testing sign in with owner@olympus.com...");
      try {
        const signInResult = await authAPI.signIn("owner@olympus.com", "demo");
        addLog(`✅ Sign in successful!`);
        addLog(`User ID: ${signInResult.user?.id || 'N/A'}`);
        addLog(`Session exists: ${!!signInResult.session}`);
        
        if (signInResult.session?.access_token) {
          addLog(`Access token (first 50 chars): ${signInResult.session.access_token.substring(0, 50)}...`);
        } else {
          addLog(`❌ No access token in session`);
          return;
        }

        // Step 4: Get session
        addLog("\nStep 4: Getting current session...");
        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse?.data?.session;
        
        if (session && session.access_token) {
          addLog(`✅ Session retrieved`);
          addLog(`Access token matches: ${session.access_token === signInResult.session?.access_token}`);
        } else {
          addLog(`❌ No session found`);
          return;
        }

        // Step 5: Test /auth/me endpoint
        addLog("\nStep 5: Testing /auth/me endpoint...");
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        };
        addLog(`Authorization header (first 60 chars): ${headers.Authorization.substring(0, 60)}...`);

        const meResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-45dc47a9/auth/me`,
          { headers }
        );

        addLog(`Response status: ${meResponse.status} ${meResponse.statusText}`);
        
        const responseText = await meResponse.text();
        addLog(`Response body: ${responseText}`);

        if (meResponse.ok) {
          const userData = JSON.parse(responseText);
          addLog(`✅ User profile retrieved successfully!`);
          addLog(`User: ${JSON.stringify(userData, null, 2)}`);
        } else {
          addLog(`❌ /auth/me failed with status ${meResponse.status}`);
          try {
            const errorData = JSON.parse(responseText);
            addLog(`Error details: ${JSON.stringify(errorData)}`);
          } catch {
            addLog(`Raw error: ${responseText}`);
          }
        }

        // Step 6: Test direct database query (client-side)
        addLog("\nStep 6: Testing direct database query from frontend...");
        try {
          const query = await supabase.from('user_profiles');
          const { data: profiles, error: profileError } = await query
            .select('*')
            .eq('email', 'owner@olympus.com')
            .single();

          if (profileError) {
            addLog(`❌ Database query error: ${profileError.message}`);
            addLog(`Error details: ${JSON.stringify(profileError)}`);
          } else if (profiles) {
            addLog(`✅ Found user profile in database!`);
            addLog(`Profile: ${JSON.stringify(profiles, null, 2)}`);
          } else {
            addLog(`❌ No user profile found in database`);
          }
        } catch (err: any) {
          addLog(`❌ Database query exception: ${err.message}`);
        }

      } catch (err: any) {
        addLog(`❌ Sign in failed: ${err.message}`);
        addLog(`Error stack: ${err.stack}`);
      }

    } catch (err: any) {
      addLog(`❌ Unexpected error: ${err.message}`);
      addLog(`Error stack: ${err.stack}`);
    } finally {
      setIsLoading(false);
      addLog("\n✨ Debug test completed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Authentication Debug Tool
          </h1>
          <p className="text-gray-600">
            This page will help diagnose the "Failed to fetch user" error
          </p>
        </div>

        <Card className="p-6 mb-6">
          <Button
            onClick={testFullFlow}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? "Running Tests..." : "🚀 Run Full Authentication Test"}
          </Button>
        </Card>

        {logs.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Debug Log</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const logText = logs.join('\n');
                  navigator.clipboard.writeText(logText);
                }}
              >
                📋 Copy Logs
              </Button>
            </div>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
              {logs.map((log, idx) => (
                <div key={idx} className="mb-1 whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}