"use client";

import styles from "./coupons.module.css";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CouponsPage = () => {
  const [activeTab, setActiveTab] = useState("active");

  const coupons = [
    {
      code: "SAVE20",
      name: "Global Winter Sale",
      type: "20% Discount",
      used: 65,
      total: 100,
      validity: "Ends Dec 31, 2024",
      status: "active",
    },
    {
      code: "WELCOME50",
      name: "New User Special",
      type: "$50.00 Fixed",
      used: 500,
      total: 500,
      validity: "Ended Oct 15, 2024",
      status: "expired",
    },
    {
      code: "FALL25",
      name: "Seasonal Collection",
      type: "25% Discount",
      used: 42,
      total: 200,
      validity: "Ends Nov 30, 2024",
      status: "active",
    },
    {
      code: "FLASH10",
      name: "Weekend Blitz",
      type: "10% Discount",
      used: 1205,
      total: null,
      validity: "No Expiration",
      status: "active",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Coupon Management</h1>
          <p>Create, monitor, and analyze discount campaigns</p>
        </div>

        <Link href="/coupons/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create New Coupon
        </Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["active", "expired", "scheduled"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Campaigns
          </button>
        ))}
      </div>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Active</p>
          <h2>124</h2>
          <span className={styles.positive}>+12%</span>
        </div>

        <div className={styles.statCard}>
          <p>Redemptions</p>
          <h2>8,542</h2>
          <span className={styles.negative}>-2.4%</span>
        </div>

        <div className={styles.statCard}>
          <p>Revenue Saved</p>
          <h2>$12,240</h2>
          <span className={styles.positive}>+5.8%</span>
        </div>
      </section>

      {/* Table */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>COUPON CODE</th>
              <th>TYPE & VALUE</th>
              <th>USAGE</th>
              <th>VALIDITY</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c, i) => {
              const percent = c.total
                ? Math.round((c.used / c.total) * 100)
                : 100;

              return (
                <tr key={i}>
                  <td>
                    <div className={styles.codeCell}>
                      <span className={styles.code}>{c.code}</span>
                      <p>{c.name}</p>
                    </div>
                  </td>

                  <td>{c.type}</td>

                  <td>
                    <div className={styles.progressWrapper}>
                      <span>
                        {c.used}/{c.total ?? "∞"} used
                      </span>
                      <div className={styles.progressBar}>
                        <div
                          style={{ width: `${percent}%` }}
                          className={styles.progressFill}
                        ></div>
                      </div>
                      <span>{percent}%</span>
                    </div>
                  </td>

                  <td>{c.validity}</td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        c.status === "active"
                          ? styles.active
                          : styles.expired
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className={styles.pagination}>
          Showing 1 to 4 of 124 coupons
        </div>
      </section>
    </div>
  );
};

export default CouponsPage;