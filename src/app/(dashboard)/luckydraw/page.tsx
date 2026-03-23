"use client";

import styles from "./luckydraw.module.css";
import { Plus, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCampaigns } from "@/services/luckydraw.service";

const LuckyDrawPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCampaigns();
        setCampaigns(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error(err);
        setCampaigns([]);
      }
    };

    fetchData();
  }, []);

  const mappedCampaigns = campaigns.map((c) => {
    const percent = c.totalVouchersLimit
      ? Math.round((c.vouchersIssued / c.totalVouchersLimit) * 100)
      : 0;
    return {
      id: c.id,
      title: c.name,
      description: c.description,
      status: c.status.toLowerCase(),
      vouchers: c.totalVouchersLimit,
      redeemed: c.vouchersIssued,
      percent,
      date: `${new Date(c.startDate).toLocaleDateString()} — ${new Date(c.endDate).toLocaleDateString()}`,
    };
  });

  const filtered = mappedCampaigns.filter((c) =>
    activeTab === "all" ? true : c.status === activeTab,
  );

  return (
    <div className={styles.container}>
      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Campaigns</p>
          <h2>{campaigns.length}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Total Vouchers</p>
          <h2>{campaigns.reduce((acc, c) => acc + c.totalVouchersLimit, 0)}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Issued</p>
          <h2>{campaigns.reduce((acc, c) => acc + c.vouchersIssued, 0)}</h2>
        </div>
      </section>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Lucky Draws</h1>
          <p>Manage promotional campaigns</p>
        </div>
        <Link href="/luckydraw/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create Campaign
        </Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["all", "active", "draft", "completed"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colCampaign} />
            <col className={styles.colDate} />
            <col className={styles.colStatus} />
            <col className={styles.colTotal} />
            <col className={styles.colRedeemed} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Date Range</th>
              <th>Status</th>
              <th>Total</th>
              <th>Redeemed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No campaigns found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  {/* Campaign */}
                  <td>
                    <div className={styles.campaignTitle}>{c.title}</div>
                    <div className={styles.campaignDesc}>{c.description}</div>
                  </td>

                  {/* Date */}
                  <td>
                    <div className={styles.dateCell}>
                      <Calendar size={13} />
                      {c.date}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`${styles.status} ${styles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Total */}
                  <td>
                    <span className={styles.voucherCount}>{c.vouchers}</span>
                  </td>

                  {/* Redeemed + Progress */}
                  <td>
                    <div className={styles.progressCell}>
                      <div className={styles.progressTop}>
                        <span className={styles.progressCount}>
                          {c.redeemed}
                        </span>
                        <span className={styles.progressPct}>{c.percent}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="View">
                        <Eye size={15} />
                      </button>
                      <button className={styles.actionBtn} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LuckyDrawPage;
