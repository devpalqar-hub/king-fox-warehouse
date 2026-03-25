"use client";

import styles from "./coupon-edit.module.css";
import { ArrowLeft, Save, Tag, Calendar, Users, Percent } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCouponById, updateCoupon } from "@/services/coupon.service";

const CouponEditPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCouponById(Number(id));
        const toDateInput = (iso: string) =>
          new Date(iso).toISOString().slice(0, 10);

        setForm({
          code: data.code ?? "",
          description: data.description ?? "",
          discountType: data.discountType ?? "PERCENTAGE",
          discountValue: data.discountValue?.toString() ?? "",
          minPurchaseAmount: data.minPurchaseAmount?.toString() ?? "",
          maxDiscountAmount: data.maxDiscountAmount?.toString() ?? "",
          usageLimit: data.usageLimit?.toString() ?? "",
          startDate: toDateInput(data.startDate),
          endDate: toDateInput(data.endDate),
        });
      } catch (err) {
        setError("Failed to load coupon. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minPurchaseAmount: form.minPurchaseAmount
          ? parseFloat(form.minPurchaseAmount)
          : undefined,
        maxDiscountAmount: form.maxDiscountAmount
          ? parseFloat(form.maxDiscountAmount)
          : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      await updateCoupon(Number(id), payload);
      setSuccessMsg("Coupon updated successfully!");
      setTimeout(() => router.push(`/coupons/${id}`), 1200);
    } catch (err) {
      setError("Failed to update coupon. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading coupon…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={`/coupons/${id}`} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1>Edit Coupon</h1>
            <p>
              Update the details for coupon <strong>{form.code}</strong>
            </p>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className={styles.alertError}>{error}</div>}
      {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Coupon Identity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Tag size={16} />
            <h2>Coupon Identity</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="code">
                Coupon Code <span className={styles.required}>*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                className={styles.input}
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={handleChange}
                required
                autoComplete="off"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className={styles.textarea}
                placeholder="Brief description of the coupon"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Discount Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Percent size={16} />
            <h2>Discount Details</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="discountType">
                Discount Type <span className={styles.required}>*</span>
              </label>
              <select
                id="discountType"
                name="discountType"
                className={styles.select}
                value={form.discountType}
                onChange={handleChange}
                required
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="discountValue">
                  Discount Value <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWithAddon}>
                  <span className={styles.addon}>
                    {form.discountType === "PERCENTAGE" ? "%" : "₹"}
                  </span>
                  <input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    className={`${styles.input} ${styles.inputAddon}`}
                    placeholder="0"
                    value={form.discountValue}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="minPurchaseAmount">
                  Min. Purchase (₹)
                </label>
                <div className={styles.inputWithAddon}>
                  <span className={styles.addon}>₹</span>
                  <input
                    id="minPurchaseAmount"
                    name="minPurchaseAmount"
                    type="number"
                    className={`${styles.input} ${styles.inputAddon}`}
                    placeholder="0"
                    value={form.minPurchaseAmount}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {form.discountType === "PERCENTAGE" && (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="maxDiscountAmount">
                  Max. Discount Amount (₹)
                </label>
                <div className={styles.inputWithAddon}>
                  <span className={styles.addon}>₹</span>
                  <input
                    id="maxDiscountAmount"
                    name="maxDiscountAmount"
                    type="number"
                    className={`${styles.input} ${styles.inputAddon}`}
                    placeholder="No cap"
                    value={form.maxDiscountAmount}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Users size={16} />
            <h2>Usage Limits</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="usageLimit">
                Total Usage Limit
              </label>
              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                className={styles.input}
                placeholder="Leave blank for unlimited"
                value={form.usageLimit}
                onChange={handleChange}
                min={1}
                step="1"
              />
              <span className={styles.hint}>
                Leave blank to allow unlimited usage.
              </span>
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Calendar size={16} />
            <h2>Validity Period</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.twoCol}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="startDate">
                  Start Date <span className={styles.required}>*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className={styles.input}
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="endDate">
                  End Date <span className={styles.required}>*</span>
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className={styles.input}
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.formFooter}>
          <Link href={`/coupons/${id}`} className={styles.btnSecondary}>
            Cancel
          </Link>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponEditPage;
