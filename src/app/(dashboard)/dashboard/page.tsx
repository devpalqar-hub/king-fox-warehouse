"use client";

import styles from "./dashboard.module.css";
import { ShoppingBag, Monitor, ShoppingCart, Warehouse } from "lucide-react";

import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import CategoryPerformance from "./CategoryPerformance";
import WarehouseAnalytics from "./WarehouseAnalytics";
import RecentOrders from "./RecentOrders";
import LatestFeedback from "./LatestFeedback";

// ── Ratio bar for Digital vs Physical ────────────────────────────────────────
const RatioBar = ({ online }: { online: number }) => (
  <div className={styles.ratioWrap}>
    <div className={styles.ratioBar}>
      <div className={styles.ratioFillOnline} style={{ width: `${online}%` }} />
    </div>
    <div className={styles.ratioLabels}>
      <span>{online}% Online</span>
      <span>{100 - online}% Physical</span>
    </div>
  </div>
);

// ── Health progress for Warehouse Health card ─────────────────────────────────
const HealthBar = ({ value }: { value: number }) => (
  <div className={styles.healthBarWrap}>
    <div className={styles.healthBarTrack}>
      <div
        className={styles.healthBarFill}
        style={{
          width: `${value}%`,
          background:
            value >= 85 ? "#22c55e" : value >= 65 ? "#f59e0b" : "#ef4444",
        }}
      />
    </div>
  </div>
);

const DashboardPage = () => (
  <div className={styles.container}>
    {/* ── Page Title ─────────────────────────────────────────── */}
    <div className={styles.pageTitle}>
      <h1>Dashboard Analytics</h1>
      <p>Real-time overview of sales, inventory, and customer activity</p>
    </div>

    {/* ── Stat Cards ─────────────────────────────────────────── */}
    <section className={styles.statsGrid}>
      <StatCard
        icon={<ShoppingBag size={18} />}
        label="Total Revenue"
        value="$4,284,500"
        trend={12.4}
        trendLabel="vs. last month"
        accent="blue"
      />
      <StatCard
        icon={<Monitor size={18} />}
        label="Digital vs Physical"
        value="64.2% Online"
        accent="blue"
        badge="Ratio 64/36"
        badgeVariant="blue"
        extra={<RatioBar online={64} />}
      />
      <StatCard
        icon={<ShoppingCart size={18} />}
        label="Total Orders"
        value="18,245"
        trend={5.2}
        trendLabel="vs. 17,341 last month"
        accent="green"
      />
      <StatCard
        icon={<Warehouse size={18} />}
        label="Warehouse Health"
        value="92.4%"
        badge="Alert"
        badgeVariant="orange"
        accent="orange"
        extra={<HealthBar value={92} />}
      />
    </section>

    {/* ── Charts Row ─────────────────────────────────────────── */}
    <section className={styles.chartsRow}>
      <SalesChart />
      <CategoryPerformance />
    </section>

    {/* ── Warehouse Analytics ────────────────────────────────── */}
    <section>
      <WarehouseAnalytics />
    </section>

    {/* ── Bottom Row: Orders + Feedback ─────────────────────── */}
    <section className={styles.bottomRow}>
      <RecentOrders />
      <LatestFeedback />
    </section>
  </div>
);

export default DashboardPage;
