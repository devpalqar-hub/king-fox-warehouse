"use client";

import { 
   Search, Filter, ChevronLeft, ChevronRight, 
  ShoppingBag, Banknote, ClipboardList, Truck 
} from 'lucide-react';
import Link from "next/link";
import styles from './orders.module.css';
import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import { Order } from "@/types/order.types";
import { OrderSummary } from "@/types/order.types";
import { getOrderSummary } from "@/services/order.service";

export default function OrdersPage() {
const [orders, setOrders] = useState<Order[]>([]);
const [pagination, setPagination] = useState<any>(null);

const [page, setPage] = useState(1);
const [limit] = useState(10);

const [status, setStatus] = useState("");
const [search, setSearch] = useState("");
const [summary, setSummary] = useState<OrderSummary | null>(null);


useEffect(() => {
  const fetchOrders = async () => {
    const res = await getOrders({
      page: 1,
      limit: 20,
    });

    if (res) {
      setOrders(res.data);
      setPagination(res.pagination);
    }
  };

  fetchOrders();
}, []);

useEffect(() => {
  const fetchSummary = async () => {
    const data = await getOrderSummary();
    setSummary(data);
  };

  fetchSummary();
}, []);

const fetchOrders = async () => {
  const res = await getOrders({
    page,
    limit,
    status,
    search,
  });

  if (res) {
    setOrders(res.data);
    setPagination(res.pagination);
  }
};

useEffect(() => {
  fetchOrders();
}, [page, status, search]);

useEffect(() => {
  const delay = setTimeout(() => {
    fetchOrders();
  }, 500);

  return () => clearTimeout(delay);
}, [search]);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Order Management</h1>
          <p>Manage and track your customer orders in real-time.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <StatCard
        icon={<ShoppingBag size={20} color="#6366f1" />}
        label="Total Orders"
        value={summary?.total || 0}
        />

        <StatCard
        icon={<Banknote size={20} color="#10b981" />}
        label="Total Revenue"
        value={`₹${summary?.totalRevenue || 0}`}
        />

        <StatCard
        icon={<ClipboardList size={20} color="#f59e0b" />}
        label="Pending Orders"
        value={summary?.byStatus?.pending || 0}
        />

        <StatCard
        icon={<Truck size={20} color="#3b82f6" />}
        label="Shipped Orders"
        value={summary?.byStatus?.shipped || 0}
        />
      </div>
        
      {/* Filters Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            className={styles.searchInput}
            placeholder="Search by Order ID..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset page
            }}
            />
        </div>
        <select
            className={styles.selectInput}
            value={status}
            onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
            }}
            >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
        </select>
        <button className={styles.iconBtn}><Filter size={18} /></button>
        <button
            className={styles.resetBtn}
            onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
            }}
            >
            Reset
        </button>
      </div>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
            <td className={styles.orderId}>#{order.orderNumber}</td>

            <td>
                {new Date(order.createdAt).toLocaleDateString()}
            </td>

            <td>
                <div className={styles.customer}>
                <span>{order.customer.name}</span>
                </div>
            </td>

            <td className={styles.amount}>₹{order.finalAmount}</td>

            <td className={styles.payment}>{order.paymentMethod}</td>

            <td>
                <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                <span className={styles.dot}></span>
                {order.status}
                </span>
            </td>

            <td>
                <Link href={`/orders/${order.id}`}>
                <button className={styles.viewBtn}>View</button>
                </Link>
            </td>
            </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className={styles.pagination}>
  <div>
  Showing <b>{orders.length}</b> of <b>{pagination?.total}</b>
</div>

  <div className={styles.pageButtons}>
    {/* Prev */}
    <button
      className={styles.pageBtn}
      disabled={page === 1}
      onClick={() => setPage((prev) => prev - 1)}
    >
      <ChevronLeft size={16} />
    </button>

    {/* Page Numbers */}
    {Array.from({ length: pagination?.totalPages || 1 }).map((_, i) => {
      const pageNumber = i + 1;

      return (
        <button
          key={pageNumber}
          className={`${styles.pageBtn} ${
            page === pageNumber ? styles.activePage : ""
          }`}
          onClick={() => setPage(pageNumber)}
        >
          {pageNumber}
        </button>
      );
    })}

    {/* Next */}
    <button
      className={styles.pageBtn}
      disabled={page === pagination?.totalPages}
      onClick={() => setPage((prev) => prev + 1)}
    >
      <ChevronRight size={16} />
    </button>
  </div>
</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className={styles.statCard}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper} style={{background: '#f8fafc'}}>{icon}</div>
        {trend && <span className={styles.trend}>{trend}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}