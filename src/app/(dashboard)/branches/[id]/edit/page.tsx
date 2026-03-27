"use client";

import formStyles from "../../branch-form.module.css";
import styles from "../../branch.module.css";
import { ArrowLeft, Store, Warehouse, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getBranch, updateBranch } from "@/services/branch.service";
import type { BranchType, UpdateBranchPayload } from "@/types/branch.types";

const BranchEditPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<UpdateBranchPayload>({
    name: "",
    phone: "",
    address: "",
    type: "SHOP",
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* Pre-fill */
  useEffect(() => {
    (async () => {
      try {
        const data = await getBranch(Number(id));
        setForm({
          name: data.name,
          phone: data.phone,
          address: data.address,
          type: data.type,
        });
      } catch (err: any) {
        setLoadError(err.message ?? "Failed to load branch.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleTypeSelect = (type: BranchType) => {
    setForm((prev) => ({ ...prev, type }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.name?.trim()) return "Branch name is required.";
    if (!form.phone?.trim()) return "Phone number is required.";
    if (!/^\d{10}$/.test(form.phone.trim()))
      return "Phone must be a valid 10-digit number.";
    if (!form.address?.trim()) return "Address is required.";
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
      await updateBranch(Number(id), form);
      setSuccess(true);
      setTimeout(() => router.push(`/branches/${id}`), 1500);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={formStyles.pageContainer}>
        <div className={formStyles.loadingState}>Loading branch details…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={formStyles.pageContainer}>
        <div className={formStyles.errorState}>{loadError}</div>
      </div>
    );
  }

  return (
    <div className={formStyles.pageContainer}>
      {/* Back */}
      <button
        className={formStyles.backBtn}
        onClick={() => router.push(`/branches/${id}`)}
      >
        <ArrowLeft size={16} /> Back to Branch
      </button>

      {/* Form Card */}
      <div className={formStyles.formCard}>
        <div className={formStyles.formCardHeader}>
          <div className={formStyles.formCardTitle}>
            <Save size={18} />
            Edit Branch
          </div>
          <p className={formStyles.formCardSub}>Update branch information</p>
        </div>

        <div className={formStyles.formCardBody}>
          {success ? (
            <div className={formStyles.successState}>
              ✓ Branch updated successfully! Redirecting…
            </div>
          ) : (
            <>
              {/* Type Selector */}
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
                    value={form.name ?? ""}
                    onChange={handleChange}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Phone Number</label>
                  <input
                    className={formStyles.formInput}
                    name="phone"
                    placeholder="10-digit number"
                    value={form.phone ?? ""}
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
                  value={form.address ?? ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <div className={formStyles.formActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => router.push(`/branches/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchEditPage;
