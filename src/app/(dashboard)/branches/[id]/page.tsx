"use client";

import styles from "../branch.module.css";
import formStyles from "../branch-form.module.css";
import {
  ArrowLeft,
  Store,
  Warehouse,
  Phone,
  MapPin,
  Clock,
  Hash,
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getBranch, deleteBranch } from "@/services/branch.service";
import type { Branch } from "@/types/branch.types";

const BranchViewPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Delete */
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const getErrorMessage = (
    err: unknown,
    fallback: string,
  ) => (err instanceof Error ? err.message : fallback);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBranch(Number(id));
        setBranch(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load branch."));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!branch) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBranch(branch.id);
      router.push("/branches");
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, "Failed to delete."));
      setDeleting(false);
    }
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className={formStyles.pageContainer}>
        <div className={formStyles.loadingState}>Loading branch details…</div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className={formStyles.pageContainer}>
        <div className={formStyles.errorState}>
          {error ?? "Branch not found."}
        </div>
      </div>
    );
  }

  const isShop = branch.type === "SHOP";

  return (
    <div className={formStyles.pageContainer}>
      {/* ── Back ── */}
      <button
        className={formStyles.backBtn}
        onClick={() => router.push("/branches")}
      >
        <ArrowLeft size={16} /> Back to Branches
      </button>

      {/* ── Card ── */}
      <div className={formStyles.viewCard}>
        {/* Header */}
        <div className={formStyles.viewHeader}>
          <div className={formStyles.viewHeaderLeft}>
            <div
              className={`${formStyles.viewIcon} ${isShop ? formStyles.viewIconShop : formStyles.viewIconWarehouse}`}
            >
              {isShop ? <Store size={26} /> : <Warehouse size={26} />}
            </div>
            <div>
              <h1 className={formStyles.viewTitle}>{branch.name}</h1>
              <span
                className={`${styles.typeBadge} ${isShop ? styles.typeShop : styles.typeWarehouse}`}
              >
                {isShop ? <Store size={12} /> : <Warehouse size={12} />}
                {branch.type}
              </span>
            </div>
          </div>

          <div className={formStyles.viewHeaderActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => router.push(`/branches/${branch.id}/edit`)}
            >
              <Pencil size={15} /> Edit
            </button>
            <button
              className={styles.btnDanger}
              onClick={() => {
                setDeleteError(null);
                setShowDelete(true);
              }}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        <div className={formStyles.viewDivider} />

        {/* Details Grid */}
        <div className={formStyles.viewGrid}>
          <div className={formStyles.viewField}>
            <div className={formStyles.viewFieldIcon}>
              <Hash size={15} />
            </div>
            <div>
              <span className={formStyles.viewFieldLabel}>Branch ID</span>
              <span className={formStyles.viewFieldValue}>#{branch.id}</span>
            </div>
          </div>

          <div className={formStyles.viewField}>
            <div className={formStyles.viewFieldIcon}>
              <Phone size={15} />
            </div>
            <div>
              <span className={formStyles.viewFieldLabel}>Phone</span>
              <span className={formStyles.viewFieldValue}>{branch.phone}</span>
            </div>
          </div>

          <div className={formStyles.viewField}>
            <div className={formStyles.viewFieldIcon}>
              <FileText size={15} />
            </div>
            <div>
              <span className={formStyles.viewFieldLabel}>GST Number</span>
              <span className={formStyles.viewFieldValue}>
                {branch.gstin || "—"}
              </span>
            </div>
          </div>

          <div
            className={`${formStyles.viewField} ${formStyles.viewFieldFull}`}
          >
            <div className={formStyles.viewFieldIcon}>
              <MapPin size={15} />
            </div>
            <div>
              <span className={formStyles.viewFieldLabel}>Address</span>
              <span className={formStyles.viewFieldValue}>
                {branch.address}
              </span>
            </div>
          </div>

          <div className={formStyles.viewField}>
            <div className={formStyles.viewFieldIcon}>
              <Clock size={15} />
            </div>
            <div>
              <span className={formStyles.viewFieldLabel}>Created At</span>
              <span className={formStyles.viewFieldValue}>
                {formatDateTime(branch.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {showDelete && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (
              modalRef.current &&
              !modalRef.current.contains(e.target as Node)
            )
              setShowDelete(false);
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
                onClick={() => setShowDelete(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMsg}>
                Are you sure you want to delete <strong>{branch.name}</strong>?
                This action cannot be undone.
              </p>
              {deleteError && (
                <div className={styles.errorMsg}>{deleteError}</div>
              )}
              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShowDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={handleDelete}
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

export default BranchViewPage;
