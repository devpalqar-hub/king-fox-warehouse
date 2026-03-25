"use client";

import styles from "./shipping.module.css";
import { useEffect, useState } from "react";
import {
  getShippingConfig,
  getShippingRates,
} from "@/services/shipping.service";
import Link from "next/link";
import { updateShippingConfig } from "@/services/shipping.service";
import { useToast } from "@/components/toast/ToastProvider";
import { Pen, Truck } from "lucide-react";

const ShippingPage = () => {
  const [config, setConfig] = useState<any>(null);
  const [rates, setRates] = useState<any[]>([]);
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [newCharge, setNewCharge] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateShippingConfig(newCharge);

      setConfig((prev: any) => ({
        ...prev,
        defaultCharge: newCharge,
      }));

      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cfg = await getShippingConfig();
        const rt = await getShippingRates();

        setConfig(cfg);
        setRates(rt);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Shipping Charge Management</h1>
          <p>Configure weight-based shipping rules and regional defaults.</p>
        </div>
        <Link href="/shipping/create" className={styles.btnPrimary}>
          <span>+</span> Create New Shipping Charge
        </Link>
      </div>

      {/* Default Shipping */}
      {config && (
        <div className={styles.card}>
          <div className={styles.defaultRow}>
            <div className={styles.defaultInfo}>
              <div className={styles.defaultIcon}>
                <Truck size={18} /> 
              </div>
              <div>
                <p className={styles.defaultTitle}>Default Shipping Rate</p>
                <small className={styles.defaultSub}>
                  Applies when no weight rule matches
                </small>
              </div>
            </div>

            <div className={styles.defaultRight}>
              <div className={styles.charge}>₹{config.defaultCharge}</div>
              <button
                className={styles.updateBtn}
                onClick={() => {
                  setNewCharge(config.defaultCharge);
                  setShowModal(true);
                }}
              >
                <Pen size={13} /> Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Min Weight (g)</th>
              <th>Max Weight (g)</th>
              <th>Charge (₹)</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {rates.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.minWeight}</td>
                <td>{r.maxWeight}</td>
                <td>
                  <span className={styles.badge}>₹{r.charge}</span>
                </td>
                {/* <td>-</td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>Showing {rates.length} rules</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className={styles.btnPage}>Prev</button>
            <button className={styles.btnPage}>Next</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Update Default Shipping</h3>

            <input
              type="number"
              className={styles.input}
              value={newCharge}
              onChange={(e) => setNewCharge(Number(e.target.value))}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.btnGhost}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className={styles.btnPrimary}
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingPage;
