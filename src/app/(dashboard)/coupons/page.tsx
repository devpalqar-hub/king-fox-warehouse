"use client";

import styles from "./coupons.module.css";
import { Eye, Plus, Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCoupons, deleteCoupon } from "@/services/coupon.service";
import { Coupon } from "@/types/coupon";

const CouponsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await getCoupons();
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCoupons([]);
    }
  };

  const getDiscountLabel = (c: Coupon) => {
    if (c.discountType === "PERCENTAGE") return `${c.discountValue}% Discount`;
    return `₹${c.discountValue} Fixed`;
  };

  const getStatus = (c: Coupon) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  const filteredCoupons = coupons.filter((c) => {
    const status = getStatus(c);
    return activeTab === "all" || status === activeTab;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Coupon Management</h1>
          <p>Create, monitor, and analyze discount campaigns</p>
        </div>
        <Link href="/coupons/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create New Coupon
        </Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["active", "expired", "scheduled"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Campaigns
          </button>
        ))}
      </div>

      {/* Table */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>COUPON CODE</th>
              <th>TYPE & VALUE</th>
              <th>USAGE</th>
              <th>VALIDITY</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No {activeTab} coupons found.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((c) => {
                const percent = c.usageLimit
                  ? Math.round((c.usedCount / c.usageLimit) * 100)
                  : 0;
                const status = getStatus(c);

                return (
                  <tr key={c.id}>
                    <td data-label="COUPON CODE">
                      <div className={styles.codeCell}>
                        <span className={styles.code}>{c.code}</span>
                        <p>{c.description}</p>
                      </div>
                    </td>
                    <td data-label="TYPE & VALUE">{getDiscountLabel(c)}</td>
                    <td data-label="USAGE">
                      <div className={styles.progressWrapper}>
                        <span>
                          {c.usedCount}/{c.usageLimit ?? "∞"} used
                        </span>
                        <div className={styles.progressBar}>
                          <div
                            style={{ width: `${percent}%` }}
                            className={styles.progressFill}
                          />
                        </div>
                        <span>{percent}%</span>
                      </div>
                    </td>
                    <td data-label="VALIDITY">
                      Ends {new Date(c.endDate).toLocaleDateString("en-IN")}
                    </td>
                    <td data-label="STATUS">
                      <span
                        className={`${styles.status} ${
                          status === "active"
                            ? styles.active
                            : status === "expired"
                              ? styles.expired
                              : styles.scheduled
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td data-label="ACTION" className={styles.actions}>
                      <Link href={`/coupons/${c.id}`}>
                        <button className={styles.iconBtn} title="View">
                          <Eye size={15} />
                        </button>
                      </Link>
                      <Link href={`/coupons/edit/${c.id}`}>
                        <button className={styles.iconBtn} title="Edit">
                          <Pen size={15} />
                        </button>
                      </Link>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Delete"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={styles.pagination}>
          Showing {filteredCoupons.length} coupon
          {filteredCoupons.length !== 1 ? "s" : ""}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              <Trash size={24} />
            </div>
            <h2>Delete Coupon?</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.code}</strong>? This action cannot be
              undone.
            </p>
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
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
