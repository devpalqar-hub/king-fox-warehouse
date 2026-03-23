"use client";

import styles from "./createShipping.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createShippingRate } from "@/services/shipping.service";
import BackButton from "@/components/backButton/backButton";

const CreateShippingPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    label: "",
    minWeight: 0,
    maxWeight: 0,
    charge: 0,
  });

  //   const [isDefault, setIsDefault] = useState(false);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (form.minWeight >= form.maxWeight) {
      alert("Min weight must be less than max weight");
      return;
    }

    try {
      await createShippingRate(form);
      router.push("/shipping");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shipping Charge Details</h1>
          <p className={styles.subtitle}>
            Configure weight-based pricing rules for deliveries.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.form}>
          {/* Label */}
          <div>
            <label className={styles.label}>Charge Label</label>
            <input
              name="label"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          {/* Weight Row */}
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Minimum Weight</label>
              <div className={styles.inputGroup}>
                <input
                  name="minWeight"
                  type="number"
                  className={styles.input}
                  onChange={handleChange}
                />
                <span className={styles.unit}>g</span>
              </div>
            </div>

            <div>
              <label className={styles.label}>Maximum Weight</label>
              <div className={styles.inputGroup}>
                <input
                  name="maxWeight"
                  type="number"
                  className={styles.input}
                  onChange={handleChange}
                />
                <span className={styles.unit}>g</span>
              </div>
            </div>
          </div>

          {/* Charge */}
          <div>
            <label className={styles.label}>Charge Amount</label>
            <input
              name="charge"
              type="number"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          {/* Default Checkbox */}
          {/* <div>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={() => setIsDefault(!isDefault)}
              />
              <span>Set as Default Rate</span>
            </div>

            <p className={styles.checkboxDesc}>
              Default rates are applied when no other rules match.
            </p>
          </div> */}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={() => router.back()}>
            Cancel
          </button>

          <button className={styles.btnPrimary} onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShippingPage;
