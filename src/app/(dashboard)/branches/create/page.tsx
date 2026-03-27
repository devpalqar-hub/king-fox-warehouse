"use client";

import formStyles from "../branch-form.module.css";
import styles from "../branch.module.css";
import { ArrowLeft, Store, Warehouse, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBranch } from "@/services/branch.service";
import type { BranchType, CreateBranchPayload } from "@/types/branch.types";

const emptyForm: CreateBranchPayload = {
  name: "",
  phone: "",
  address: "",
  type: "SHOP",
};

const BranchCreatePage = () => {
  const router = useRouter();

  const [form, setForm] = useState<CreateBranchPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleTypeSelect = (type: BranchType) => {
    setForm((prev) => ({ ...prev, type }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Branch name is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!/^\d{10}$/.test(form.phone.trim()))
      return "Phone must be a valid 10-digit number.";
    if (!form.address.trim()) return "Address is required.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBranch(form);
      setSuccess(true);
      setTimeout(() => router.push("/branches"), 1500);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={formStyles.pageContainer}>
      {/* Back */}
      <button
        className={formStyles.backBtn}
        onClick={() => router.push("/branches")}
      >
        <ArrowLeft size={16} /> Back to Branches
      </button>

      {/* Form Card */}
      <div className={formStyles.formCard}>
        {/* Card Header */}
        <div className={formStyles.formCardHeader}>
          <div className={formStyles.formCardTitle}>
            <Plus size={18} />
            Create New Branch
          </div>
          <p className={formStyles.formCardSub}>
            Add a new shop or warehouse location
          </p>
        </div>

        <div className={formStyles.formCardBody}>
          {success ? (
            <div className={formStyles.successState}>
              ✓ Branch created successfully! Redirecting…
            </div>
          ) : (
            <>
              {/* Branch Type Selector */}
              <div className={formStyles.formGroup}>
                <label className={formStyles.formLabel}>Branch Type</label>
                <div className={formStyles.typeSelector}>
                  <button
                    type="button"
                    className={`${formStyles.typeOption} ${form.type === "SHOP" ? formStyles.typeOptionActive : ""}`}
                    onClick={() => handleTypeSelect("SHOP")}
                  >
                    <Store size={22} />
                    <span className={formStyles.typeOptionLabel}>Shop</span>
                    <span className={formStyles.typeOptionDesc}>
                      Retail location
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${formStyles.typeOption} ${form.type === "WAREHOUSE" ? formStyles.typeOptionActiveWarehouse : ""}`}
                    onClick={() => handleTypeSelect("WAREHOUSE")}
                  >
                    <Warehouse size={22} />
                    <span className={formStyles.typeOptionLabel}>
                      Warehouse
                    </span>
                    <span className={formStyles.typeOptionDesc}>
                      Storage facility
                    </span>
                  </button>
                </div>
              </div>

              {/* Name + Phone */}
              <div className={formStyles.formRow}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Branch Name</label>
                  <input
                    className={formStyles.formInput}
                    name="name"
                    placeholder="e.g. Anna Nagar Branch"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Phone Number</label>
                  <input
                    className={formStyles.formInput}
                    name="phone"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Address */}
              <div className={formStyles.formGroup}>
                <label className={formStyles.formLabel}>Address</label>
                <textarea
                  className={`${formStyles.formInput} ${formStyles.formTextarea}`}
                  name="address"
                  placeholder="Full address with city and PIN"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              {/* Actions */}
              <div className={formStyles.formActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => router.push("/branches")}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Creating…" : "Create Branch"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchCreatePage;
