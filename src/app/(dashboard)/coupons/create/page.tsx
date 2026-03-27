"use client";

import styles from "./createCoupon.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoupon } from "@/services/coupon.service";
import { useToast } from "@/components/toast/ToastProvider";
import BackButton from "@/components/backButton/backButton";

const CreateCouponPage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.code || !form.discountValue || !form.startDate) {
        showToast("Please fill required fields", "error");
        return;
      }

      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minPurchaseAmount: Number(form.minPurchaseAmount),
        maxDiscountAmount: form.maxDiscountAmount
          ? Number(form.maxDiscountAmount)
          : null,
        usageLimit: Number(form.usageLimit),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      await createCoupon(payload);
      showToast("Coupon created successfully!", "success");
      router.push("/coupons");
    } catch (error) {
      showToast("Failed to create coupon", "error");
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.header}>Create New Coupon</h1>

      {/* General Info */}
      <section className={styles.card}>
        <h3>General Information</h3>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>
              Coupon Code <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              name="code"
              placeholder="e.g. SUMMER20"
              onChange={handleChange}
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Discount Type <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              name="discountType"
              onChange={handleChange}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            name="description"
            placeholder="Brief description of this coupon"
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Discount */}
      <section className={styles.card}>
        <h3>Discount Configuration</h3>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>
              Discount Value <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              name="discountValue"
              type="number"
              placeholder={
                form.discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 100"
              }
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Min. Purchase Amount (₹)</label>
            <input
              className={styles.input}
              name="minPurchaseAmount"
              type="number"
              placeholder="e.g. 500"
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Max. Discount Amount (₹)</label>
            <input
              className={styles.input}
              name="maxDiscountAmount"
              type="number"
              placeholder="Leave blank for no cap"
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Usage Limit</label>
            <input
              className={styles.input}
              name="usageLimit"
              type="number"
              placeholder="Leave blank for unlimited"
              onChange={handleChange}
              min={1}
            />
          </div>
        </div>
      </section>

      {/* Dates */}
      <section className={styles.card}>
        <h3>Validity Period</h3>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>
              Start Date <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="date"
              name="startDate"
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              End Date <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="date"
              name="endDate"
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.secondaryBtn}
          onClick={() => router.push("/coupons")}
        >
          Cancel
        </button>
        <button className={styles.primaryBtn} onClick={handleSubmit}>
          Save Coupon Template
        </button>
      </div>
    </div>
  );
};

export default CreateCouponPage;
