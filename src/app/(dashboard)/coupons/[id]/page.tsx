"use client";

import styles from "./coupon-view.module.css";
import {
  ArrowLeft,
  Tag,
  Calendar,
  Users,
  TrendingUp,
  Hash,
  Percent,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Pen,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCouponById } from "@/services/coupon.service";
import { Coupon } from "@/types/coupon";

const CouponViewPage = () => {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCouponById(Number(id));
        setCoupon(data);
      } catch (err) {
        setError("Failed to load coupon details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const getStatus = (c: Coupon) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading coupon details…</p>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className={styles.errorWrapper}>
        <XCircle size={40} />
        <p>{error ?? "Coupon not found."}</p>
        <Link href="/coupons" className={styles.backLink}>
          ← Back to Coupons
        </Link>
      </div>
    );
  }

  const status = getStatus(coupon);
  const usagePercent = coupon.usageLimit
    ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/coupons" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1>{coupon.code}</h1>
            <p>{coupon.description}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <span
            className={`${styles.statusBadge} ${
              status === "active"
                ? styles.active
                : status === "expired"
                  ? styles.expired
                  : styles.scheduled
            }`}
          >
            {status === "active" && <CheckCircle2 size={12} />}
            {status === "scheduled" && <Clock size={12} />}
            {status === "expired" && <XCircle size={12} />}
            {status}
          </span>

          <Link href={`/coupons/edit/${coupon.id}`} className={styles.editBtn}>
            <Pen size={15} />
            Edit Coupon
          </Link>
        </div>
      </header>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eef2ff", color: "#4f46e5" }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{coupon.usedCount}</span>
            <span className={styles.statLabel}>Times Used</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#f0fdf4", color: "#16a34a" }}
          >
            <Users size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{coupon.usageLimit ?? "∞"}</span>
            <span className={styles.statLabel}>Usage Limit</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#fffbeb", color: "#d97706" }}
          >
            <Percent size={18} />
          </div>
          <div>
            <span className={styles.statValue}>{usagePercent}%</span>
            <span className={styles.statLabel}>Utilisation</span>
          </div>
        </div>
      </div>

      {/* Body Grid */}
      <div className={styles.bodyGrid}>
        {/* Discount Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Tag size={16} />
            <h2>Discount Details</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Coupon Code</span>
              <span className={`${styles.fieldValue} ${styles.codeChip}`}>
                {coupon.code}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Discount Type</span>
              <span className={styles.fieldValue}>
                {coupon.discountType === "PERCENTAGE"
                  ? "Percentage (%)"
                  : "Fixed Amount (₹)"}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Discount Value</span>
              <span className={`${styles.fieldValue} ${styles.highlight}`}>
                {coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Min. Purchase Amount</span>
              <span className={styles.fieldValue}>
                {coupon.minPurchaseAmount
                  ? `₹${coupon.minPurchaseAmount}`
                  : "—"}
              </span>
            </div>

            {coupon.maxDiscountAmount && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Max. Discount Amount</span>
                <span className={styles.fieldValue}>
                  ₹{coupon.maxDiscountAmount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Validity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Calendar size={16} />
            <h2>Validity Period</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Start Date</span>
              <span className={styles.fieldValue}>
                {formatDate(coupon.startDate)}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>End Date</span>
              <span className={styles.fieldValue}>
                {formatDate(coupon.endDate)}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Created At</span>
              <span className={styles.fieldValue}>
                {formatDateTime(coupon.createdAt)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className={styles.usageSection}>
            <div className={styles.usageHeader}>
              <span>Usage Progress</span>
              <span className={styles.usageCount}>
                {coupon.usedCount} / {coupon.usageLimit ?? "∞"}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <span className={styles.usagePercent}>
              {usagePercent}% utilised
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponViewPage;
