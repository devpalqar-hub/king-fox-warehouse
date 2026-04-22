"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { getOfflineOrders } from "@/services/order.service";
import { OfflineOrder, OfflineOrderResponse } from "@/types/order.types";
import styles from "./offline-orders.module.css";

// const STATUS_OPTIONS = [
//   "PAYMENT_PENDING",
//   "PENDING",
//   "CONFIRMED",
//   "PACKED",
//   "SHIPPED",
//   "DELIVERED",
//   "CANCELLED",
// ] as const;

const SOURCE_TYPE_OPTIONS = ["ONLINE", "OFFLINE"] as const;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "--";
  }

  return currencyFormatter.format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusClass(status: string) {
  return styles[status.toLowerCase()] || styles.defaultStatus;
}

function getSourceType(order: OfflineOrder) {
  return order.sourceType || "OFFLINE";
}

export default function OfflineOrdersPage() {
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [pagination, setPagination] = useState<
    OfflineOrderResponse["pagination"] | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // const [status, setStatus] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const timeout = setTimeout(async () => {
      setLoading(true);

      const response = await getOfflineOrders({
        page,
        limit,
        sourceType,
        search: invoiceNumber,
      });

      if (!isMounted) {
        return;
      }

      setOrders(response?.data ?? []);
      setPagination(response?.pagination ?? null);
      setLoading(false);
    }, invoiceNumber ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [invoiceNumber, limit, page, sourceType]);

  const handleReset = () => {
    setInvoiceNumber("");
    // setStatus("");
    setSourceType("");
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Offline Orders</h1>
          <p>
            Browse invoice-based orders, filter by source and status, and open
            full order details when needed.
          </p>
        </div>
        <div className={styles.summaryPill}>
          <span>Total Records</span>
          <strong>{pagination?.total ?? 0}</strong>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={invoiceNumber}
            onChange={(event) => {
              setInvoiceNumber(event.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
            placeholder="Search by invoice number"
          />
        </div>

        <select
          className={styles.selectInput}
          value={sourceType}
          onChange={(event) => {
            setSourceType(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Source Types</option>
          {SOURCE_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {/* <select
          className={styles.selectInput}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatStatusLabel(option)}
            </option>
          ))}
        </select> */}

        <button className={styles.resetBtn} onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableMeta}>
          <span>
            Page <strong>{pagination?.page ?? page}</strong> of{" "}
            <strong>{totalPages}</strong>
          </span>
          <span>
            Showing <strong>{orders.length}</strong> of{" "}
            <strong>{pagination?.total ?? 0}</strong> orders
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Source</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Staff</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className={styles.emptyState}>
                    Loading offline orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.emptyState}>
                    No offline orders matched the current filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const currentSourceType = getSourceType(order);

                  return (
                    <tr key={order.id}>
                      <td data-label="Invoice" className={styles.invoiceCell}>
                        <div className={styles.primaryText}>
                          {order.invoiceNumber}
                        </div>
                        <div className={styles.secondaryText}>ID #{order.id}</div>
                      </td>
                      <td data-label="Date">{formatDate(order.createdAt)}</td>
                      <td data-label="Source">
                        <span
                          className={`${styles.sourceBadge} ${
                            styles[currentSourceType.toLowerCase()] ||
                            styles.defaultSource
                          }`}
                        >
                          {currentSourceType}
                        </span>
                      </td>
                      <td data-label="Customer">
                        <div className={styles.primaryText}>
                          {order.customer?.name || "Walk-in Customer"}
                        </div>
                        <div className={styles.secondaryText}>
                          {order.customer?.phone || "--"}
                        </div>
                      </td>
                      <td data-label="Branch">
                        {order.branch?.name || "--"}
                      </td>
                      <td data-label="Staff">{order.user?.name || "--"}</td>
                      <td data-label="Items">{order._count?.items ?? 0}</td>
                      <td data-label="Amount" className={styles.amountCell}>
                        {formatCurrency(order.finalAmount)}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
                        >
                          {formatStatusLabel(order.status)}
                        </span>
                      </td>
                      <td data-label="Action">
                        <Link
                          href={`/offline-orders/${order.id}`}
                          className={styles.iconLink}
                          aria-label={`View ${order.invoiceNumber}`}
                          title="View order details"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <div className={styles.pageIndicator}>
            <strong>{page}</strong> / {totalPages}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages || loading}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
