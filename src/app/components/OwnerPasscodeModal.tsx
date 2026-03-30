import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { Lock, X } from "lucide-react";

interface OwnerPasscodeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OwnerPasscodeModal({ isOpen, onSuccess, onCancel }: OwnerPasscodeModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passcode === "9900") {
      setError("");
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError("Incorrect passcode. Please try again.");
      setPasscode("");
      
      if (attempts >= 2) {
        setError("Too many failed attempts. Contact support for access.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-6 bg-card border-border shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="size-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Owner Access Code</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Creating an owner account requires a special access code. If you're a sales rep, please select "Sales Rep" instead.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="passcode" className="text-foreground">
              Enter Access Code
            </Label>
            <Input
              id="passcode"
              type="password"
              placeholder="••••"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError("");
              }}
              autoFocus
              maxLength={4}
              className="mt-1 bg-input-background border-border text-foreground text-center text-lg tracking-widest"
              disabled={attempts >= 3}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={attempts >= 3 || !passcode}
            >
              Verify
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Don't have an access code? Contact your administrator.
        </p>
      </Card>
    </div>
  );
}