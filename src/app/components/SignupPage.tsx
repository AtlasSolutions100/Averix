import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { VeridexLogo } from "@/app/components/VeridexLogo";
import { OwnerPasscodeModal } from "@/app/components/OwnerPasscodeModal";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "@/services/api";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

interface SignupPageProps {
  onSignup: (user: User) => void;
  onBackToLogin: () => void;
}

export function SignupPage({ onSignup, onBackToLogin }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"owner" | "rep">("rep"); // Default to rep
  const [officeName, setOfficeName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeVerified, setPasscodeVerified] = useState(false);

  // Set SEO for signup page
  useSEO(SEO_CONFIGS.signup);

  const handleRoleChange = (value: "owner" | "rep") => {
    setRole(value);

    // If switching to owner, show passcode modal (unless already verified)
    if (value === "owner" && !passcodeVerified) {
      setShowPasscodeModal(true);
    }
  };

  const handlePasscodeSuccess = () => {
    setPasscodeVerified(true);
    setShowPasscodeModal(false);
    toast.success("Access verified!", {
      description: "You can now create an owner account.",
    });
  };

  const handlePasscodeCancel = () => {
    setShowPasscodeModal(false);
    setRole("rep"); // Switch back to rep
    setPasscodeVerified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error("Please fill in all required fields");
      }

      if (role === "owner" && !officeName) {
        throw new Error("Please enter your office name");
      }

      if (role === "rep" && !officeId) {
        throw new Error("Please enter your office ID");
      }

      // Sign up user
      const signupData = await authAPI.signUp(
        email,
        password,
        name,
        role,
        role === "owner" ? officeName : officeId
      );

      console.log("Signup successful:", signupData);

      // Sign in the user
      await authAPI.signIn(email, password);

      // Get user profile
      const userData = await authAPI.getMe();

      onSignup(userData);
      toast.success("Account created successfully!", {
        description: `Welcome to Veridex, ${name}!`,
      });
    } catch (err: any) {
      console.error("Signup error:", err);

      // Check for duplicate email error
      if (err.message?.includes("already exists") || err.message?.includes("email_exists")) {
        setError("This email is already registered. Please sign in instead.");
        toast.error("Account already exists", {
          description: "This email is already registered. Try signing in instead.",
          duration: 5000,
        });
      }
      // Check if it's a server connectivity issue
      else if (err.message?.includes("Load failed") || err.message?.includes("fetch")) {
        setError(
          "⚠️ Cannot connect to server. The Supabase Edge Function needs to be deployed. See SERVER_DEPLOYMENT_GUIDE.md"
        );
        toast.error("Server not available", {
          description: "Backend server needs deployment. Check console for details.",
          duration: 7000,
        });
      } else {
        setError(err.message || "Failed to create account");
        toast.error("Signup failed", {
          description: err.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <VeridexLogo className="w-32 h-32" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Veridex</h1>
          <p className="text-lg text-muted-foreground font-medium">Scale what actually matters</p>
          <p className="text-sm text-muted-foreground mt-1">Turn Hustle Into Data</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8 shadow-2xl border-border bg-card/50 backdrop-blur-sm">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
            <h2 className="text-xl font-semibold text-foreground mb-1">Create your account</h2>
            <p className="text-sm text-muted-foreground">Get started with Veridex</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            {/* Role Selection */}
            <div>
              <Label className="text-foreground mb-2 block">
                I am a... <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={role}
                onValueChange={handleRoleChange}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                  <RadioGroupItem value="owner" id="role-owner" />
                  <Label htmlFor="role-owner" className="cursor-pointer flex-1">
                    <div className="font-semibold text-foreground">Office Owner</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Manage team & analytics
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                  <RadioGroupItem value="rep" id="role-rep" />
                  <Label htmlFor="role-rep" className="cursor-pointer flex-1">
                    <div className="font-semibold text-foreground">Sales Rep</div>
                    <div className="text-xs text-muted-foreground mt-1">Track my performance</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Fields Based on Role */}
            {role === "owner" ? (
              <div>
                <Label htmlFor="officeName" className="text-foreground">
                  Office Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="officeName"
                  type="text"
                  placeholder="Los Angeles HQ"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  required={role === "owner"}
                  className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A new office will be created for you
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="officeId" className="text-foreground">
                  Office ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="officeId"
                  type="text"
                  placeholder="Enter invite code from your owner"
                  value={officeId}
                  onChange={(e) => setOfficeId(e.target.value)}
                  required={role === "rep"}
                  className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your office owner for this code
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>

      {/* Owner Passcode Modal */}
      <OwnerPasscodeModal
        isOpen={showPasscodeModal}
        onSuccess={handlePasscodeSuccess}
        onCancel={handlePasscodeCancel}
      />
    </div>
  );
}