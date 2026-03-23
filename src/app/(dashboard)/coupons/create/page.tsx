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
          <input
            className={styles.input}
            name="code"
            placeholder="Coupon Code"
            onChange={handleChange}
          />

          <select className={styles.select} name="discountType" onChange={handleChange}>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed (₹)</option>
          </select>
        </div>

        <textarea
          className={styles.textarea}
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
      </section>

      {/* Discount */}
      <section className={styles.card}>
        <h3>Discount Configuration</h3>

        <div className={styles.grid}>
          <input
            className={styles.input}
            name="discountValue"
            placeholder="Discount Value"
            onChange={handleChange}
          />
          <input
            className={styles.input}
            name="minPurchaseAmount"
            placeholder="Min Purchase"
            onChange={handleChange}
          />
          <input
            className={styles.input}
            name="maxDiscountAmount"
            placeholder="Max Discount"
            onChange={handleChange}
          />
        </div>

        <input
          className={styles.input}
          name="usageLimit"
          placeholder="Usage Limit"
          onChange={handleChange}
        />
      </section>

      {/* Dates */}
      <section className={styles.card}>
        <h3>Validity Period</h3>

        <div className={styles.grid}>
          <input className={styles.input} type="date" name="startDate" onChange={handleChange} />
          <input className={styles.input} type="date" name="endDate" onChange={handleChange} />
        </div>
      </section>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.secondaryBtn}onClick={() => router.push("/coupons")}>Cancel</button>

        <button className={styles.primaryBtn} onClick={handleSubmit}>
          Save Coupon Template
        </button>
      </div>
    </div>
  );
};

export default CreateCouponPage;
