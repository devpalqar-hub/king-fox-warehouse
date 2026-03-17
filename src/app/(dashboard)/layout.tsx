"use client";

import AuthGuard from "@/auth/AuthGuard";
import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div style={{ display: "flex" }}>
        
        {/* Sidebar */}
        <Sidebar />

        <div style={{ flex: 1 }}>
          
          {/* Header */}
          <Header />

          {/* Page content */}
          <main style={{ width: "100%" }}>
            {children}
          </main>

        </div>
      </div>
    </AuthGuard>
  );
}