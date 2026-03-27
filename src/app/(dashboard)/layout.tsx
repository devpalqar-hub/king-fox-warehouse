"use client";

import AuthGuard from "@/auth/AuthGuard";
import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className={styles.dashboardContainer}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className={styles.mainContent}>
          {/* Header */}
          <Header />

          {/* Content */}
          <main className={styles.contentArea}>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
