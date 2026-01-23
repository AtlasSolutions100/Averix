import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {children}
    </div>
  );
}
