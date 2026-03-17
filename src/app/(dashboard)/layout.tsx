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
      <div>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div
          style={{
            marginLeft: "300px", 
          }}
        >
          {/* Header */}
          <Header />

          {/* Content */}
          <main
            style={{
              marginTop: "85px",
              padding: "24px",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}