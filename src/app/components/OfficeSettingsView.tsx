import { useState, useEffect } from "react";
import { Building2, Save, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { User } from "@/app/App";
import { officeAPI } from "@/services/api";

interface OfficeSettingsViewProps {
  user: User;
}

export function OfficeSettingsView({ user }: OfficeSettingsViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [officeName, setOfficeName] = useState(user.officeName);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(officeName !== user.officeName);
  }, [officeName, user.officeName]);

  const handleCopyOfficeId = () => {
    navigator.clipboard.writeText(user.officeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await officeAPI.updateOffice(user.officeId, { name: officeName });
      
      alert("Office settings saved successfully! Reload the page to see the new name.");
      setHasChanges(false);
    } catch (error: any) {
      console.error("Failed to save office settings:", error);
      alert(error.message || "Failed to save office settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="size-8" />
          <h1 className="text-2xl font-semibold">Office Settings</h1>
        </div>
        <p className="text-white/80">
          Manage your office configuration and information
        </p>
      </div>

      {/* Office Information */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Office Information</h2>
          
          <div className="space-y-4">
            {/* Office ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Office ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={user.officeId}
                  readOnly
                  className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOfficeId}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this ID with new reps so they can join your office
              </p>
            </div>

            {/* Office Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Office Name
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="Enter office name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This name appears throughout the dashboard for all team members
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="size-4" />
              <span>You have unsaved changes</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Data & Privacy</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Building2 className="size-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Multi-Tenant Isolation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your office data is completely isolated. Other offices cannot view or access
                your stores, reps, or performance data.
              </p>
            </div>
          </div>

          <div className="p-4 bg-secondary/30 border border-border rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Data Storage</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All data is encrypted at rest and in transit</li>
              <li>• Daily entries are backed up automatically</li>
              <li>• Data retention: Unlimited history</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team Access */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Team Access</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Owner Role</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have full access to all features and data
              </p>
            </div>
            <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
              Active
            </div>
          </div>

          <div className="p-4 bg-secondary/30 border border-border rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Rep Permissions</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Can view their own performance data</li>
              <li>• Can submit daily entries and track LOAs</li>
              <li>• Cannot view other reps' detailed data</li>
              <li>• Cannot manage stores or team members</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            These actions are permanent and cannot be undone. Use with caution.
          </p>
          
          <Button
            variant="outline"
            className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            disabled
          >
            Delete Office (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}