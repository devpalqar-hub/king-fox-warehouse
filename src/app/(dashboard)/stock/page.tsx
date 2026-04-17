"use client";

import styles from "./stocklog.module.css";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ClipboardList,
  Download,
  Search,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";
import {
  getCurrentYearExportRange,
  requestExport,
} from "@/services/export.service";
import {
  fetchStockLogs,
  type StockLogEntry,
  type StockLogSummary,
  type StockLogFilterType,
} from "@/services/stocklog.service";

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

const FILTERS: { label: string; value: StockLogFilterType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New Stock", value: "NEW_STOCK" },
  { label: "Transfer", value: "TRANSFER" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  // timeStr is "HH:mm"
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "New Stock":
      return {
        className: styles.badgeGreen,
        icon: <ArrowDownToLine size={11} />,
        label: "New Stock",
      };
    case "Transfer":
      return {
        className: styles.badgeOrange,
        icon: <ArrowLeftRight size={11} />,
        label: "Transfer",
      };
    case "Stock Reduction":
      return {
        className: styles.badgeRed,
        icon: <TrendingDown size={11} />,
        label: "Reduction",
      };
    default:
      return { className: styles.badgeGray, icon: null, label: type };
  }
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ── Component ────────────────────────────────────────────────────────────────
const StockLogPage = () => {
  const { showToast } = useToast();

  // ── State ──
  const [logs, setLogs] = useState<StockLogEntry[]>([]);
  const [summary, setSummary] = useState<StockLogSummary>({
    totalEntries: 0,
    newStockAdded: 0,
    transfersMade: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StockLogFilterType | "ALL">(
    "ALL",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce search ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, page: 1 })); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // ── Fetch logs ──
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchStockLogs({

        page: pagination.page,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        filterType: activeFilter as StockLogFilterType,
      });
      console.log("API RESPONSE:", res);
      setLogs(res.data);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load stock logs.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, debouncedSearch, activeFilter, showToast]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedSearch, activeFilter]);

  // ── Filter change: reset page ──
  const handleFilterChange = (value: StockLogFilterType | "ALL") => {
    setActiveFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  // ── Pagination handlers ──
  const goToPrev = () =>
    setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }));

  const goToNext = () =>
    setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }));

  // ── Export ──
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { startDate, endDate } = getCurrentYearExportRange();
      await requestExport({
        type: "STOCK",
        format: "EXCEL",
        startDate,
        endDate,
      });
      showToast(
        "Stock export requested. The Excel file will be sent to your email.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to request stock export.",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ── Derived ──
  const startEntry = (pagination.page - 1) * PAGE_LIMIT + 1;
  const endEntry = Math.min(pagination.page * PAGE_LIMIT, pagination.total);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Stock Log</h1>
          <p>Track all stock additions and branch transfers in one place.</p>
        </div>
        <button
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={16} />
          {isExporting ? "Requesting..." : "Export Excel"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconBlue}`}>
            <ClipboardList size={18} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Total Entries</p>
            <p className={styles.summaryValue}>{summary.totalEntries}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconGreen}`}>
            <ArrowDownToLine size={18} />
          </div>
          <div>
            <p className={styles.summaryLabel}>New Stock Added</p>
            <p className={styles.summaryValue}>
              {summary.newStockAdded}{" "}
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
              {summary.transfersMade}{" "}
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
                key={f.value}
                className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterActive : ""}`}
                onClick={() => handleFilterChange(f.value)}
              >
                {f.label}
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

        {/* Loading / Error overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingSpinner} />
            Loading…
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={loadLogs}>
              Retry
            </button>
          </div>
        )}

        {/* ── Desktop / Tablet: standard table ── */}
        {!error && (
          <div className={styles.tableScroll}>
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
                {!isLoading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyRow}>
                      No stock log entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const badge = getTypeBadge(log.type);
                    return (
                      <tr key={log.id}>
                        {/* User */}
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar}>
                              {getInitials(log.user.name)}
                            </div>
                            <div>
                              <p className={styles.userName}>{log.user.name}</p>
                              <p className={styles.userRole}>{log.user.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <span
                            className={`${styles.typeBadge} ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>

                        {/* Product / SKU */}
                        <td>
                          <span className={styles.productName}>
                            {log.productSku}
                          </span>
                        </td>

                        {/* Branch */}
                        <td>
                          <span className={styles.branchSingle}>
                            {log.branch}
                          </span>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className={styles.badge}>
                            {log.amount} units
                          </span>
                        </td>

                        {/* Date */}
                        <td className={styles.dateText}>
                          {formatDate(log.date)}
                        </td>

                        {/* Time */}
                        <td className={styles.timeText}>
                          {formatTime(log.time)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Mobile: card list ── */}
        {!error && (
          <div className={styles.mobileCardList}>
            {!isLoading && logs.length === 0 ? (
              <div className={styles.emptyMobile}>
                No stock log entries found.
              </div>
            ) : (
              logs.map((log) => {
                const badge = getTypeBadge(log.type);
                return (
                  <div key={log.id} className={styles.mobileCard}>
                    {/* Card top row */}
                    <div className={styles.mobileCardTop}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {getInitials(log.user.name)}
                        </div>
                        <div>
                          <p className={styles.userName}>{log.user.name}</p>
                          <p className={styles.userRole}>{log.user.role}</p>
                        </div>
                      </div>
                      <span
                        className={`${styles.typeBadge} ${badge.className}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    {/* Product */}
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Product</span>
                      <span className={styles.productName}>
                        {log.productSku}
                      </span>
                    </div>

                    {/* Branch */}
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Branch</span>
                      <span className={styles.branchSingle}>{log.branch}</span>
                    </div>

                    {/* Bottom row */}
                    <div className={styles.mobileCardBottom}>
                      <span className={styles.badge}>{log.amount} units</span>
                      <span className={styles.mobileMeta}>
                        <span className={styles.dateText}>
                          {formatDate(log.date)}
                        </span>
                        <span className={styles.mobileMetaDot}>·</span>
                        <span className={styles.timeText}>
                          {formatTime(log.time)}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>
            {pagination.total === 0
              ? "No entries"
              : `Showing ${startEntry}–${endEntry} of ${pagination.total} entries`}
          </span>

          <div className={styles.paginationBtns}>
            <button
              className={styles.btnPage}
              onClick={goToPrev}
              disabled={pagination.page <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            <span className={styles.pageIndicator}>
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              className={styles.btnPage}
              onClick={goToNext}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLogPage;
