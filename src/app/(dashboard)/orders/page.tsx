"use client";

import React from 'react';
import { 
  Plus, Search, Filter, ChevronLeft, ChevronRight, 
  ShoppingBag, Banknote, ClipboardList, Truck 
} from 'lucide-react';
import Link from "next/link";
import styles from './orders.module.css';

const orders = [
  { id: '#ORD-20260323-001', date: '23 Mar 2026', customer: 'Rahul Kumar', amount: '₹1,150', payment: 'COD', status: 'Pending', img: 'https://i.pravatar.cc/150?u=1' },
  { id: '#ORD-20260323-002', date: '23 Mar 2026', customer: 'Anjali Sharma', amount: '₹4,290', payment: 'UPI', status: 'Shipped', img: 'https://i.pravatar.cc/150?u=2' },
  { id: '#ORD-20260322-098', date: '22 Mar 2026', customer: 'Vikram Singh', amount: '₹12,400', payment: 'Card', status: 'Delivered', img: 'https://i.pravatar.cc/150?u=3' },
  { id: '#ORD-20260322-095', date: '22 Mar 2026', customer: 'Sneha Roy', amount: '₹850', payment: 'COD', status: 'Cancelled', img: 'https://i.pravatar.cc/150?u=4' },
];

export default function OrdersPage() {
  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Order Management</h1>
          <p>Manage and track your customer orders in real-time.</p>
        </div>
        <button className={styles.createBtn}>
          <Plus size={18} /> Create New Order
        </button>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <StatCard icon={<ShoppingBag size={20} color="#6366f1"/>} label="Total Order Count" value="1,240" trend="+12%" />
        <StatCard icon={<Banknote size={20} color="#10b981"/>} label="Total Revenue" value="₹15,42,000" trend="+8.4%" />
        <StatCard icon={<ClipboardList size={20} color="#f59e0b"/>} label="Pending Tasks" value="42" />
        <StatCard icon={<Truck size={20} color="#3b82f6"/>} label="In Transit" value="118" />
      </div>
        
      {/* Filters Section */}
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input className={styles.searchInput} placeholder="Search by Order ID (#ORD-2026...)" />
        </div>
        <select className={styles.selectInput}>
          <option>All Status</option>
        </select>
        <button className={styles.iconBtn}><Filter size={18} /></button>
        <button className={styles.resetBtn}>Reset</button>
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
                <td className={styles.orderId}>{order.id}</td>
                <td>{order.date}</td>
                <td>
                  <div className={styles.customer}>
                    <img src={order.img} className={styles.avatar} alt="" />
                    <span>{order.customer}</span>
                  </div>
                </td>
                <td className={styles.amount}>{order.amount}</td>
                <td className={styles.payment}>{order.payment}</td>
                <td>
                  <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                    <span className={styles.dot}></span>
                    {order.status}
                  </span>
                </td>
                <td>
                <Link href={`/orders/${order.id.replace('#', '')}`}>
                    <button className={styles.viewBtn}>View</button>
                </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className={styles.pagination}>
          <div>Showing <b>1 to 10</b> of <b>1,240</b> results</div>
          <div className={styles.pageButtons}>
            <button className={styles.pageBtn}><ChevronLeft size={16}/></button>
            <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span>...</span>
            <button className={styles.pageBtn}>124</button>
            <button className={styles.pageBtn}><ChevronRight size={16}/></button>
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