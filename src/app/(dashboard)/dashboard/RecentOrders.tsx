"use client";

import styles from "./dashboard.module.css";

// Mock data — replace with API
const MOCK_ORDERS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    orderId: "ORD-98421",
    amount: 124.5,
    status: "Delivered",
    statusVariant: "delivered",
    avatar: "SJ",
    time: "2 mins ago",
  },
  {
    id: 2,
    name: "Marcus Aurelius",
    orderId: "ORD-98023",
    amount: 89.0,
    status: "Processing",
    statusVariant: "processing",
    avatar: "MA",
    time: "15 mins ago",
  },
  {
    id: 3,
    name: "Tessa Lee",
    orderId: "ORD-94019",
    amount: 210.2,
    status: "Shipped",
    statusVariant: "shipped",
    avatar: "TL",
    time: "1 hr ago",
  },
];

const RecentOrders = () => (
  <div className={styles.ordersCard}>
    <div className={styles.ordersHeader}>
      <h2 className={styles.sectionTitle}>Recent Orders</h2>
      <span className={styles.ordersSubBadge}>Last 24 Hours</span>
    </div>

    <div className={styles.ordersList}>
      {MOCK_ORDERS.map((order) => (
        <div key={order.id} className={styles.orderRow}>
          <div className={styles.orderAvatar}>{order.avatar}</div>
          <div className={styles.orderInfo}>
            <p className={styles.orderName}>{order.name}</p>
            <p className={styles.orderId}>{order.orderId}</p>
          </div>
          <div className={styles.orderRight}>
            <p className={styles.orderAmount}>${order.amount.toFixed(2)}</p>
            <span
              className={`${styles.orderStatus} ${styles[`orderStatus_${order.statusVariant}`]}`}
            >
              {order.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentOrders;
