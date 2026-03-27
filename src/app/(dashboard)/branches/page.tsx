"use client";

import styles from "./branch.module.css";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Store,
  Warehouse,
  MapPin,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getBranches, deleteBranch } from "@/services/branch.service";
import type { Branch, BranchType } from "@/types/branch.types";

/* ── Constants ──────────────────────────────── */
const PAGE_SIZE = 10;
const TABS = ["ALL", "SHOP", "WAREHOUSE"] as const;
type TabValue = (typeof TABS)[number];

const TYPE_ICON: Record<BranchType, React.ReactNode> = {
  SHOP: <Store size={13} />,
  WAREHOUSE: <Warehouse size={13} />,
};

/* ── Component ──────────────────────────────── */
const BranchListPage = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabValue>("ALL");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  /* Delete modal */
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ─────────────────────────────────── */
  const fetchBranches = async (tab: TabValue, pg: number) => {
    setLoading(true);
    try {
      const res = await getBranches({
        type: tab === "ALL" ? undefined : (tab as BranchType),
        page: pg,
        limit: PAGE_SIZE,
      });
      setBranches(res);
      setTotal(res.length);
      setTotalPages(Math.ceil(res.length / PAGE_SIZE));
    } catch (err) {
      console.error(err);
      setBranches([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(activeTab, page);
  }, [activeTab, page]);

  /* Reset page when tab changes */
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setPage(1);
  };

  /* ── Delete ────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBranch(deleteTarget.id);
      setDeleteTarget(null);
      fetchBranches(activeTab, page);
    } catch (err: any) {
      setDeleteError(err.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Stats ─────────────────────────────────── */
  const shopCount = branches.filter((b) => b.type === "SHOP").length;
  const warehouseCount = branches.filter((b) => b.type === "WAREHOUSE").length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* Pagination range */
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  /* ── Render ────────────────────────────────── */
  return (
    <div className={styles.container}>
      {/* ── Stats ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Branches</p>
          <h2>{total}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Shops</p>
          <h2>{shopCount}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Warehouses</p>
          <h2>{warehouseCount}</h2>
        </div>
      </section>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1>Branches</h1>
          <p>Manage shop &amp; warehouse locations</p>
        </div>
        <Link href="/branches/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create Branch
        </Link>
      </header>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colName} />
            <col className={styles.colPhone} />
            <col className={styles.colAddress} />
            <col className={styles.colType} />
            <col className={styles.colDate} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>Branch Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Type</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <span className={styles.loadingDots}>Loading</span>
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No branches found.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b.id}>
                  {/* Name */}
                  <td data-label="Branch Name">
                    <div className={styles.nameCell}>
                      <div
                        className={`${styles.branchIcon} ${b.type === "SHOP" ? styles.iconShop : styles.iconWarehouse}`}
                      >
                        {b.type === "SHOP" ? (
                          <Store size={15} />
                        ) : (
                          <Warehouse size={15} />
                        )}
                      </div>
                      <span className={styles.nameText}>{b.name}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td data-label="Phone">
                    <div className={styles.phoneCell}>
                      <Phone size={13} />
                      {b.phone}
                    </div>
                  </td>

                  {/* Address */}
                  <td data-label="Address">
                    <div className={styles.addressCell}>
                      <MapPin size={13} />
                      <span>{b.address}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td data-label="Type">
                    <span
                      className={`${styles.typeBadge} ${b.type === "SHOP" ? styles.typeShop : styles.typeWarehouse}`}
                    >
                      {TYPE_ICON[b.type]}
                      {b.type}
                    </span>
                  </td>

                  {/* Date */}
                  <td data-label="Created">
                    <div className={styles.dateCell}>
                      <Calendar size={13} />
                      {formatDate(b.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="View"
                        onClick={() => router.push(`/branches/${b.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        title="Edit"
                        onClick={() => router.push(`/branches/${b.id}/edit`)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        title="Delete"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(b);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && total > 0 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing{" "}
              <strong>
                {from}–{to}
              </strong>{" "}
              of <strong>{total}</strong> branches
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className={styles.pageEllipsis}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ""}`}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (
              modalRef.current &&
              !modalRef.current.contains(e.target as Node)
            )
              setDeleteTarget(null);
          }}
        >
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleDanger}>
                <AlertTriangle size={18} />
                Delete Branch
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMsg}>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.name}</strong>? This action cannot be
                undone.
              </p>
              {deleteError && (
                <div className={styles.errorMsg}>{deleteError}</div>
              )}
              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchListPage;
