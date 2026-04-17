"use client";

import styles from "./dashboard.module.css";
import { ShoppingBag, Monitor, ShoppingCart, Warehouse } from "lucide-react";
import { useState, useEffect } from "react";

import StatCard from "./StatCard";
import SalesChart from "./SalesChart";
import CategoryPerformance from "./CategoryPerformance";
import WarehouseAnalytics from "./WarehouseAnalytics";
import RecentOrders from "./RecentOrders";
import LatestFeedback from "./LatestFeedback";

import {
  getDashboardOverview,
  getSalesComparison,
  getCategoryPerformance,
  getLatestFeedback,
  getRecentOrders,
  getWarehouseAnalytics,
} from "@/services/dashboard.service";
import type {
  DashboardOverview,
  SalesComparison,
  CategoryPerformanceData,
  Feedback,
  RecentOrder,
  WarehouseData,
} from "@/types/dashboard";

// ── Ratio bar for Digital vs Physical ────────────────────────────────────────
const RatioBar = ({ online }: { online: number }) => (
  <div className={styles.ratioWrap}>
    <div className={styles.ratioBar}>
      <div className={styles.ratioFillOnline} style={{ width: `${online.toFixed(2)}%` }} />
    </div>
    <div className={styles.ratioLabels}>
      <span>{online.toFixed(2)}% Online</span>
      <span>{(100 - online).toFixed(2)}% Physical</span>
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

const DashboardPage = () => {
  // ─── State for API data ────────────────────────────────────────────────────
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [salesComparison, setSalesComparison] =
    useState<SalesComparison | null>(null);
  const [categories, setCategories] = useState<CategoryPerformanceData[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch all dashboard data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          overviewData,
          salesData,
          categoryData,
          feedbackData,
          ordersData,
          warehouseData,
        ] = await Promise.all([
          getDashboardOverview(),
          getSalesComparison(1),
          getCategoryPerformance(),
          getLatestFeedback(),
          getRecentOrders(),
          getWarehouseAnalytics(),
        ]);

        setOverview(overviewData);
        setSalesComparison(salesData);
        setCategories(categoryData);
        setFeedback(feedbackData);
        setOrders(ordersData);
        setWarehouses(warehouseData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── Format currency ──────────────────────────────────────────────────────
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
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
          value={
            loading
              ? "Loading..."
              : overview
                ? formatCurrency(overview.revenue.total)
                : "₹0"
          }
          trend={overview?.revenue.growth}
          trendLabel="vs. last month"
          accent="blue"
        />
        <StatCard
          icon={<Monitor size={18} />}
          label="Digital vs Physical"
          value={
            loading || !overview
              ? "Loading..."
              : `${overview.digitalVsPhysical.online.toFixed(1)}% Online`
          }
          accent="blue"
          badge={overview?.digitalVsPhysical.label || "Ratio"}
          badgeVariant="blue"
          extra={
            overview ? (
              <RatioBar online={overview.digitalVsPhysical.online} />
            ) : null
          }
        />
        <StatCard
          icon={<ShoppingCart size={18} />}
          label="Total Orders"
          value={
            loading
              ? "Loading..."
              : overview
                ? overview.orders.total.toLocaleString()
                : "0"
          }
          trendLabel={
            overview
              ? `${overview.orders.onlineCount} online, ${overview.orders.offlineCount} offline`
              : ""
          }
          accent="green"
        />
        <StatCard
          icon={<Warehouse size={18} />}
          label="Warehouse Health"
          value={
            loading
              ? "Loading..."
              : overview
                ? `${overview.warehouseHealth.toFixed(1)}%`
                : "0%"
          }
          badge={
            overview
              ? overview.warehouseHealth >= 85
                ? "Healthy"
                : overview.warehouseHealth >= 65
                  ? "Good"
                  : "Critical"
              : "Alert"
          }
          badgeVariant={
            overview
              ? overview.warehouseHealth >= 85
                ? "green"
                : overview.warehouseHealth >= 65
                  ? "orange"
                  : "red"
              : "orange"
          }
          accent={
            overview
              ? overview.warehouseHealth >= 85
                ? "green"
                : overview.warehouseHealth >= 65
                  ? "orange"
                  : "red"
              : "orange"
          }
          extra={
            overview ? <HealthBar value={overview.warehouseHealth} /> : null
          }
        />
      </section>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <section className={styles.chartsRow}>
        <SalesChart data={salesComparison} loading={loading} />
        <CategoryPerformance data={categories} loading={loading} />
      </section>

      {/* ── Warehouse Analytics ────────────────────────────────── */}
      <section>
        <WarehouseAnalytics data={warehouses} loading={loading} />
      </section>

      {/* ── Bottom Row: Orders + Feedback ─────────────────────── */}
      <section className={styles.bottomRow}>
        <RecentOrders data={orders} loading={loading} />
        <LatestFeedback data={feedback} loading={loading} />
      </section>
    </div>
  );
};

export default DashboardPage;
