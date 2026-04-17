"use client";

import styles from "./dashboard.module.css";
import type { RecentOrder } from "@/types/dashboard";

interface RecentOrdersProps {
  data: RecentOrder[];
  loading?: boolean;
}

const RecentOrders = ({ data, loading = false }: RecentOrdersProps) => {
  // ─── Format date to readable time ago ──────────────────────────────────────
  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const ms = now.getTime() - past.getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(ms / 86400000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return past.toLocaleDateString();
  };

  // ─── Get status color variant ──────────────────────────────────────────────
  const getStatusVariant = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "delivered";
    if (statusLower === "shipped") return "shipped";
    if (statusLower === "cancelled") return "cancelled";
    if (statusLower === "packed") return "packed";
    if (statusLower === "confirmed") return "confirmed";
    if (statusLower === "pending") return "pending";
    // Default fallback
    return "processing";
  };

  // ─── Get avatar initials ──────────────────────────────────────────────────
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.ordersCard}>
      <div className={styles.ordersHeader}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <span className={styles.ordersSubBadge}>Last 24 Hours</span>
      </div>

      {loading ? (
        <div className={styles.ordersList}>
          <p className={styles.loadingText}>Loading orders...</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className={styles.ordersList}>
          {data.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              <div className={styles.orderAvatar}>
                {getInitials(order.customerName)}
              </div>
              <div className={styles.orderInfo}>
                <p className={styles.orderName}>{order.customerName}</p>
                <p className={styles.orderId}>{order.id}</p>
              </div>
              <div className={styles.orderRight}>
                <p className={styles.orderAmount}>₹{order.amount.toFixed(2)}</p>
                <span
                  className={`${styles.orderStatus} ${styles[`orderStatus_${getStatusVariant(order.status)}`]}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.ordersList}>
          <p className={styles.loadingText}>No orders found</p>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
