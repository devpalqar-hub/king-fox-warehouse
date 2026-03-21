"use client";

import styles from "./luckydraw.module.css";
import { Plus, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCampaigns } from "@/services/luckydraw.service";
import { useToast } from "@/components/toast/ToastProvider";

const LuckyDrawPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCampaigns();
      setCampaigns(data);
    };

    fetchData();
  }, []);

  // 🔥 map API → UI
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
      date: `${new Date(c.startDate).toLocaleDateString()} — ${new Date(
        c.endDate,
      ).toLocaleDateString()}`,
    };
  });

  const filtered = mappedCampaigns.filter((c) =>
    activeTab === "all" ? true : c.status === activeTab,
  );

  return (
    <div className={styles.container}>
      {/* Stats (can be dynamic later) */}
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
            className={`${styles.tab} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <section className={styles.list}>
        {filtered.map((c) => (
          <div key={c.id} className={styles.card}>
            {/* LEFT */}
            <div className={styles.left}>
              <h3>{c.title}</h3>
              <p className={styles.desc}>{c.description}</p>

              <div className={styles.meta}>
                <Calendar size={14} />
                {c.date}
              </div>

              <span className={`${styles.status} ${styles[c.status]}`}>
                {c.status}
              </span>
            </div>

            {/* MIDDLE */}
            <div className={styles.middle}>
              <div>
                <p>Total</p>
                <h4>{c.vouchers}</h4>
              </div>

              <div>
                <p>Redeemed</p>
                <h4>{c.redeemed}</h4>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${c.percent}%` }}
                  />
                </div>

                <span>{c.percent}%</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className={styles.actions}>
              <Eye size={18} />
              <Pencil size={18} />
              <Trash2 size={18} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LuckyDrawPage;
