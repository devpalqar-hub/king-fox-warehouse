"use client";

import styles from "./luckydraw.module.css";
import { Plus, Calendar, Ticket, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const LuckyDrawPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const campaigns = [
    {
      title: "Kingfox Summer Lucky Draw 2025",
      status: "active",
      vouchers: 500,
      redeemed: 124,
      percent: 25,
      date: "Apr 1, 2025 — Jul 31, 2025",
    },
    {
      title: "Winter Gala 2024",
      status: "completed",
      vouchers: 1000,
      redeemed: 1000,
      percent: 100,
      date: "Nov 1, 2024 — Dec 31, 2024",
    },
    {
      title: "Spring Pop-up Extravaganza",
      status: "draft",
      vouchers: 200,
      redeemed: 0,
      percent: 0,
      date: "May 1, 2025 — May 15, 2025",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Participants</p>
          <h2>24.5k</h2>
          <span className={styles.positive}>+12%</span>
        </div>

        <div className={styles.statCard}>
          <p>Voucher Redemption Rate</p>
          <h2>68.2%</h2>
          <span className={styles.positive}>+4.3%</span>
        </div>

        <div className={styles.statCard}>
          <p>Total Campaign Value</p>
          <h2>$128k</h2>
          <span className={styles.muted}>Target: $150k</span>
        </div>
      </section>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Lucky Draws</h1>
          <p>Manage and monitor your active promotional campaigns</p>
        </div>

        <Link href="/luckydraw/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create New Campaign
        </Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["all", "active", "draft", "completed"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <section className={styles.list}>
        {campaigns.map((c, i) => (
          <div key={i} className={styles.card}>
            {/* Left */}
            <div className={styles.left}>
              <h3>{c.title}</h3>

              <div className={styles.meta}>
                <span>
                  <Calendar size={14} /> {c.date}
                </span>
              </div>

              <span className={`${styles.status} ${styles[c.status]}`}>
                {c.status}
              </span>
            </div>

            {/* Middle */}
            <div className={styles.middle}>
              <div>
                <p>Total Vouchers</p>
                <h4>{c.vouchers}</h4>
              </div>

              <div>
                <p>Redeemed</p>
                <h4>{c.redeemed}</h4>
                <div className={styles.progressBar}>
                  <div
                    style={{ width: `${c.percent}%` }}
                    className={styles.progressFill}
                  ></div>
                </div>
                <span>{c.percent}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {c.status === "completed" ? (
                <Eye size={18} />
              ) : (
                <>
                  <Pencil size={18} />
                  <Trash2 size={18} />
                </>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LuckyDrawPage;
