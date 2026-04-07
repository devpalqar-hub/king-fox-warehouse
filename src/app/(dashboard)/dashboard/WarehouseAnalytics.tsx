"use client";

import styles from "./dashboard.module.css";
import { MapPin } from "lucide-react";
import Link from "next/link";
import type { WarehouseData } from "@/types/dashboard";

interface WarehouseAnalyticsProps {
  data: WarehouseData[];
  loading?: boolean;
}

// ─── Determine health variant based on health label ────────────────────────
const getHealthVariant = (
  label: string,
): "healthy" | "lowstock" | "critical" => {
  const labelLower = label.toLowerCase();
  if (labelLower.includes("healthy")) return "healthy";
  if (labelLower.includes("critical")) return "critical";
  if (labelLower.includes("low")) return "lowstock";
  return "healthy";
};

const WarehouseAnalytics = ({
  data,
  loading = false,
}: WarehouseAnalyticsProps) => (
  <div className={styles.warehouseCard}>
    <div className={styles.warehouseHeader}>
      <div>
        <h2 className={styles.sectionTitle}>Warehouse Analytics</h2>
        <p className={styles.sectionSub}>
          Inventory health across regional hubs
        </p>
      </div>
      <Link href="/inventory" className={styles.viewLogLink}>
        View Detailed Log →
      </Link>
    </div>

    {loading ? (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p className={styles.loadingText}>Loading warehouse data...</p>
      </div>
    ) : data && data.length > 0 ? (
      <table className={styles.warehouseTable}>
        <thead>
          <tr>
            <th>Hub Location</th>
            <th>Manager</th>
            <th>Stock Health</th>
            <th>Utilisation</th>
          </tr>
        </thead>
        <tbody>
          {data.map((hub) => (
            <tr key={hub.id}>
              <td>
                <div className={styles.hubLocation}>
                  <MapPin size={13} className={styles.mapPin} />
                  <span>{hub.location}</span>
                </div>
              </td>
              <td className={styles.hubManager}>{hub.manager}</td>
              <td>
                <div className={styles.healthCell}>
                  <div className={styles.healthBar}>
                    <div
                      className={`${styles.healthFill} ${styles[`health_${getHealthVariant(hub.healthLabel)}`]}`}
                      style={{ width: `${hub.stockHealth}%` }}
                    />
                  </div>
                  <span
                    className={`${styles.healthLabel} ${styles[`healthTxt_${getHealthVariant(hub.healthLabel)}`]}`}
                  >
                    {hub.stockHealth}% {hub.healthLabel}
                  </span>
                </div>
              </td>
              <td className={styles.utilisationCell}>{hub.utilisation}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p className={styles.loadingText}>No warehouse data available</p>
      </div>
    )}
  </div>
);

export default WarehouseAnalytics;
