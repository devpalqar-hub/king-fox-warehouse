"use client";

import styles from "./shipping.module.css";
import { useEffect, useState } from "react";
import {
  getShippingConfig,
  getShippingRates,
} from "@/services/shipping.service";
import Link from "next/link";

const ShippingPage = () => {
  const [config, setConfig] = useState<any>(null);
  const [rates, setRates] = useState<any[]>([]);

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
            <div>
              <p className={styles.defaultTitle}>Default Shipping Rate</p>
              <small className={styles.defaultSub}>
                Applies when no weight rule matches
              </small>
            </div>
            <div className={styles.charge}>₹{config.defaultCharge}</div>
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
    </div>
  );
};

export default ShippingPage;
