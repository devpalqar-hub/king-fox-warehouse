"use client";

import styles from "./stocklog.module.css";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ClipboardList,
  Search,

} from "lucide-react";

// ── Mock data (replace with API later) ──────────────────────────────────────
const MOCK_LOGS = [
  {
    id: 1,
    user: "Arjun Menon",
    userRole: "Warehouse Manager",
    avatar: "AM",
    type: "new_stock",
    amount: 120,
    product: "Classic White Tee – L",
    branch: "Main Warehouse",
    toBranch: null,
    date: "2025-03-25T09:14:00Z",
  },
  {
    id: 2,
    user: "Priya Nair",
    userRole: "Branch Supervisor",
    avatar: "PN",
    type: "transfer",
    amount: 40,
    product: "Slim Fit Denim – 32",
    branch: "Main Warehouse",
    toBranch: "Kochi Branch",
    date: "2025-03-24T14:32:00Z",
  },
  {
    id: 3,
    user: "Rohit Das",
    userRole: "Stock Associate",
    avatar: "RD",
    type: "new_stock",
    amount: 75,
    product: "Sports Polo – XL",
    branch: "Kochi Branch",
    toBranch: null,
    date: "2025-03-24T11:05:00Z",
  },
  {
    id: 4,
    user: "Meera Pillai",
    userRole: "Branch Supervisor",
    avatar: "MP",
    type: "transfer",
    amount: 25,
    product: "Oversized Hoodie – M",
    branch: "Kochi Branch",
    toBranch: "Thrissur Branch",
    date: "2025-03-23T16:48:00Z",
  },
  {
    id: 5,
    user: "Arjun Menon",
    userRole: "Warehouse Manager",
    avatar: "AM",
    type: "new_stock",
    amount: 200,
    product: "Cargo Pants – 34",
    branch: "Main Warehouse",
    toBranch: null,
    date: "2025-03-22T08:30:00Z",
  },
  {
    id: 6,
    user: "Sanya Iyer",
    userRole: "Stock Associate",
    avatar: "SI",
    type: "transfer",
    amount: 60,
    product: "Classic White Tee – M",
    branch: "Main Warehouse",
    toBranch: "Kozhikode Branch",
    date: "2025-03-21T13:20:00Z",
  },
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const FILTERS = ["All", "New Stock", "Transfer"];

const StockLogPage = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MOCK_LOGS.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.product.toLowerCase().includes(search.toLowerCase()) ||
      log.branch.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "New Stock" && log.type === "new_stock") ||
      (activeFilter === "Transfer" && log.type === "transfer");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Stock Log</h1>
          <p>Track all stock additions and branch transfers in one place.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconBlue}`}>
            <ClipboardList size={18} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Total Entries</p>
            <p className={styles.summaryValue}>{MOCK_LOGS.length}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconGreen}`}>
            <ArrowDownToLine size={18} />
          </div>
          <div>
            <p className={styles.summaryLabel}>New Stock Added</p>
            <p className={styles.summaryValue}>
              {MOCK_LOGS.filter((l) => l.type === "new_stock").reduce(
                (s, l) => s + l.amount,
                0,
              )}{" "}
              <span className={styles.summaryUnit}>units</span>
            </p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconOrange}`}>
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Transfers Made</p>
            <p className={styles.summaryValue}>
              {MOCK_LOGS.filter((l) => l.type === "transfer").reduce(
                (s, l) => s + l.amount,
                0,
              )}{" "}
              <span className={styles.summaryUnit}>units</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by user, product or branch…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Product / SKU</th>
              <th>Branch</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  No stock log entries found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  {/* User */}
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{log.avatar}</div>
                      <div>
                        <p className={styles.userName}>{log.user}</p>
                        <p className={styles.userRole}>{log.userRole}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    {log.type === "new_stock" ? (
                      <span
                        className={`${styles.typeBadge} ${styles.badgeGreen}`}
                      >
                        <ArrowDownToLine size={11} />
                        New Stock
                      </span>
                    ) : (
                      <span
                        className={`${styles.typeBadge} ${styles.badgeOrange}`}
                      >
                        <ArrowLeftRight size={11} />
                        Transfer
                      </span>
                    )}
                  </td>

                  {/* Product */}
                  <td data-label="Product">
                    <span className={styles.productName}>{log.product}</span>
                  </td>

                  {/* Branch */}
                  <td>
                    {log.type === "transfer" && log.toBranch ? (
                      <div className={styles.branchTransfer}>
                        <span className={styles.branchFrom}>{log.branch}</span>
                        <ArrowLeftRight
                          size={12}
                          className={styles.branchArrow}
                        />
                        <span className={styles.branchTo}>{log.toBranch}</span>
                      </div>
                    ) : (
                      <span className={styles.branchSingle}>{log.branch}</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td>
                    <span className={styles.badge}>{log.amount} units</span>
                  </td>

                  {/* Date */}
                  <td className={styles.dateText}>{formatDate(log.date)}</td>

                  {/* Time */}
                  <td className={styles.timeText}>{formatTime(log.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>
            Showing {filtered.length} of {MOCK_LOGS.length} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnPage} disabled>
              Prev
            </button>
            <button className={styles.btnPage} disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLogPage;
