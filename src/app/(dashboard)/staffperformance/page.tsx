"use client";

import { useEffect, useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Download,
  IndianRupee,
  MapPin,
  Users,
} from "lucide-react";
import styles from "./staffperformance.module.css";
import { getBranches } from "@/services/branch.service";
import {
  getCurrentYearExportRange,
  requestExport,
} from "@/services/export.service";
import { getStaffPerformance } from "@/services/staff-performance.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { Branch } from "@/types/branch.types";
import type {
  StaffPerformanceRanking,
  StaffPerformanceResponse,
} from "@/types/staff-performance.types";
import StatCard from "../dashboard/StatCard";

const PAGE_SIZE = 10;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatRole = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "NA";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getVisiblePages = (page: number, totalPages: number) =>
  Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(
      (pageNumber) =>
        pageNumber === 1 ||
        pageNumber === totalPages ||
        Math.abs(pageNumber - page) <= 1,
    )
    .reduce<Array<number | "...">>((accumulator, pageNumber, index, source) => {
      if (index > 0 && pageNumber - source[index - 1] > 1) {
        accumulator.push("...");
      }

      accumulator.push(pageNumber);
      return accumulator;
    }, []);

const getRoleClassName = (role: string) => {
  switch (role) {
    case "ADMIN":
      return styles.roleAdmin;
    case "MANAGER":
      return styles.roleManager;
    case "CASHIER":
      return styles.roleCashier;
    default:
      return styles.roleStaff;
  }
};

export default function StaffPerformancePage() {
  const { showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [performance, setPerformance] =
    useState<StaffPerformanceResponse | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadBranches = async () => {
      try {
        const branchData = await getBranches();

        if (!ignore) {
          setBranches(branchData);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (!ignore) {
          showToast(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load branches.",
            "error",
          );
        }
      }
    };

    loadBranches();

    return () => {
      ignore = true;
    };
  }, [showToast]);

  useEffect(() => {
    let ignore = false;

    const loadStaffPerformance = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getStaffPerformance({
          page,
          limit: PAGE_SIZE,
          branchId: selectedBranch ? Number(selectedBranch) : undefined,
        });

        if (!ignore) {
          setPerformance(data);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (!ignore) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load staff performance.";

          setPerformance(null);
          setError(message);
          showToast(message, "error");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStaffPerformance();

    return () => {
      ignore = true;
    };
  }, [page, selectedBranch, showToast]);

  const rankings = performance?.rankings ?? [];
  const pagination = performance?.pagination ?? {
    total: 0,
    page,
    limit: PAGE_SIZE,
    totalPages: 1,
  };
  const showingFrom =
    rankings.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const showingTo =
    rankings.length > 0 ? showingFrom + rankings.length - 1 : 0;
  const topPerformer =
    performance?.topPerformer.trim() || rankings[0]?.name || "No data yet";

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { startDate, endDate } = getCurrentYearExportRange();

      await requestExport({
        type: "STAFF_PERFORMANCE",
        format: "EXCEL",
        startDate,
        endDate,
        branchIds: selectedBranch ? [Number(selectedBranch)] : undefined,
      });

      showToast(
        "Staff performance export requested. The Excel file will be sent to your email.",
        "success",
      );
    } catch (exportError) {
      console.error(exportError);

      showToast(
        exportError instanceof Error
          ? exportError.message
          : "Failed to request staff performance export.",
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h1>Staff Performance</h1>
          <p>
            Track revenue contribution and branch-wise staff rankings from one
            place.
          </p>
        </div>

        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={16} />
          {isExporting ? "Requesting..." : "Export Excel"}
        </button>
      </div>

      <section className={styles.statsGrid}>
        <StatCard
          icon={<Award size={20} />}
          label="Top Performer"
          value={topPerformer}
          sub="Highest ranked staff member"
          accent="orange"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Total Revenue"
          value={formatCurrency(performance?.totalRevenue ?? 0)}
          sub="Revenue from the current selection"
          accent="green"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Active Personnel"
          value={String(performance?.activePersonnel ?? 0)}
          sub="Staff included in this report"
          accent="blue"
        />
      </section>

      <section className={styles.filterCard}>
        <div className={styles.filterCopy}>
          <span className={styles.filterLabel}>Branch Filter</span>
          <p className={styles.filterDescription}>
            Filter by branch name
          </p>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.selectWrapper}>
            <MapPin size={16} className={styles.selectIcon} />
            <select
              className={styles.selectField}
              value={selectedBranch}
              onChange={(event) => {
                setSelectedBranch(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={styles.resetButton}
            onClick={() => {
              setSelectedBranch("");
              setPage(1);
            }}
            disabled={!selectedBranch}
          >
            Reset
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2>Staff Rankings</h2>
            <p>Extensive revenue-based performance analytics</p>
          </div>
          <span className={styles.tableSummary}>
            {pagination.total} personnel
          </span>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.loadingState}>
                    Loading staff performance...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className={styles.errorState}>
                    {error}
                  </td>
                </tr>
              ) : rankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No staff performance records found for this branch.
                  </td>
                </tr>
              ) : (
                rankings.map(
                  (ranking: StaffPerformanceRanking, index: number) => {
                    const absoluteRank =
                      (pagination.page - 1) * pagination.limit + index + 1;
                    const isTopRank = pagination.page === 1 && index === 0;

                    return (
                      <tr
                        key={ranking.id}
                        className={isTopRank ? styles.topRow : undefined}
                      >
                        <td data-label="Rank">
                          <span
                            className={`${styles.rankBadge} ${isTopRank ? styles.rankTop : ""}`}
                          >
                            #{absoluteRank}
                          </span>
                        </td>
                        <td data-label="Staff Member">
                          <div className={styles.memberCell}>
                            <div className={styles.avatar}>
                              {getInitials(ranking.name)}
                            </div>
                            <div>
                              <p className={styles.memberName}>
                                {ranking.name || "Unnamed Staff"}
                              </p>
                              {isTopRank && (
                                <span className={styles.topTag}>
                                  Top performer
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td data-label="Role">
                          <span
                            className={`${styles.roleBadge} ${getRoleClassName(ranking.role)}`}
                          >
                            {formatRole(ranking.role) || "Unknown"}
                          </span>
                        </td>
                        <td data-label="Branch" className={styles.branchText}>
                          {ranking.branch.trim() || "Unassigned"}
                        </td>
                        <td data-label="Revenue" className={styles.revenueCell}>
                          {formatCurrency(ranking.revenue)}
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing <strong>{showingFrom}</strong> to <strong>{showingTo}</strong>{" "}
            of <strong>{pagination.total}</strong> personnel
          </span>

          <div className={styles.paginationControls}>
            <button
              className={styles.pageButton}
              disabled={page === 1 || loading}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {getVisiblePages(page, pagination.totalPages).map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className={styles.pageEllipsis}
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  className={`${styles.pageButton} ${page === pageNumber ? styles.pageButtonActive : ""}`}
                  onClick={() => setPage(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              className={styles.pageButton}
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
