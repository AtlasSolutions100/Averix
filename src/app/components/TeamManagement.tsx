import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { usersAPI } from "@/services/api";
import { User } from "@/app/App";
import { UserPlus, Trash2, Copy, Users, Eye, EyeOff } from "lucide-react";

interface TeamManagementProps {
  user: User;
}

interface RepUser {
  id: string;
  email: string;
  name: string;
  role: string;
  office_id: string;
  created_at: string;
}

export function TeamManagement({ user }: TeamManagementProps) {
  const [users, setUsers] = useState<RepUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [newRepEmail, setNewRepEmail] = useState("");
  const [newRepPassword, setNewRepPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getUsers();
      setUsers(response.users || []);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRep = async () => {
    if (!newRepName || !newRepEmail || !newRepPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const response = await usersAPI.createRep({
        name: newRepName,
        email: newRepEmail,
        password: newRepPassword,
      });

      toast.success("Rep created successfully!", {
        description: `${newRepName} has been added to your team`,
      });

      // Show credentials modal
      setCreatedCredentials(response.credentials);

      // Reload users list
      await loadUsers();

      // Reset form
      setNewRepName("");
      setNewRepEmail("");
      setNewRepPassword("");
      setShowCreateModal(false);
    } catch (error: any) {
      console.error("Failed to create rep:", error);
      toast.error("Failed to create rep", {
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from your team? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      toast.success(`${userName} has been removed`);
      await loadUsers();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to remove team member", {
        description: error.message,
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewRepPassword(password);
  };

  const reps = users.filter((u) => u.role === "rep");
  const owners = users.filter((u) => u.role === "owner" || u.role === "cydcor");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage your sales reps and team members
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Rep
        </Button>
      </div>

      {/* Office Info */}
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Office Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Office Name:</span>
                <p className="text-foreground font-medium">{user.officeName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Office ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-secondary/50 rounded text-xs font-mono text-foreground">
                    {user.officeId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.officeId, "Office ID")}
                    className="h-8 text-primary"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this with reps who want to join your office
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{reps.length}</p>
            <p className="text-xs text-muted-foreground">Active Reps</p>
          </div>
        </div>
      </Card>

      {/* Sales Reps List */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Sales Reps</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {reps.length} {reps.length === 1 ? "rep" : "reps"} in your team
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        ) : reps.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">No reps yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first rep to start building your team
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Your First Rep
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reps.map((rep) => (
              <div
                key={rep.id}
                className="p-6 hover:bg-secondary/20 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{rep.name}</p>
                  <p className="text-sm text-muted-foreground">{rep.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(rep.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(rep.id, rep.name)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Owners List */}
      {owners.length > 0 && (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Owners</h3>
          </div>
          <div className="divide-y divide-border">
            {owners.map((owner) => (
              <div
                key={owner.id}
                className="p-6 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{owner.name}</p>
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {owner.role === "cydcor" ? "Cydcor Admin" : "Owner"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Rep Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl border-border bg-card">
            <h3 className="text-xl font-bold text-foreground mb-4">Add New Rep</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="repName" className="text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="repName"
                  type="text"
                  placeholder="John Smith"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  className="mt-1 bg-input-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="repEmail" className="text-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="repEmail"
                  type="email"
                  placeholder="john@company.com"
                  value={newRepEmail}
                  onChange={(e) => setNewRepEmail(e.target.value)}
                  className="mt-1 bg-input-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="repPassword" className="text-foreground">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id="repPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newRepPassword}
                      onChange={(e) => setNewRepPassword(e.target.value)}
                      className="pr-10 bg-input-background border-border text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    className="border-border"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll share this password with the rep
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRepName("");
                    setNewRepEmail("");
                    setNewRepPassword("");
                  }}
                  className="flex-1 border-border"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRep}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Rep"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Credentials Display Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl border-border bg-card">
            <h3 className="text-xl font-bold text-foreground mb-2">Rep Created Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share these credentials with your new rep. They won't be shown again.
            </p>

            <div className="space-y-3 mb-6">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-foreground">{createdCredentials.email}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdCredentials.email, "Email")}
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Password</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-foreground">{createdCredentials.password}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdCredentials.password, "Password")}
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setCreatedCredentials(null)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
