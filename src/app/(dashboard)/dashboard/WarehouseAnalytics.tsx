"use client";

import styles from "./dashboard.module.css";
import { MapPin } from "lucide-react";
import Link from "next/link";
import type { WarehouseData } from "@/types/dashboard";

interface WarehouseAnalyticsProps {
  data: WarehouseData[];
  loading?: boolean;
}

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
      <div className={styles.stateBox}>
        <p className={styles.loadingText}>Loading warehouse data...</p>
      </div>
    ) : data && data.length > 0 ? (
      <div className={styles.warehouseTableWrapper}>
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
            {data.map((hub) => {
              const variant = getHealthVariant(hub.healthLabel);
              return (
                <tr key={hub.id}>
                  <td data-label="Hub Location">
                    <div className={styles.hubLocation}>
                      <MapPin size={13} className={styles.mapPin} />
                      <span>{hub.location}</span>
                    </div>
                  </td>
                  <td data-label="Manager" className={styles.hubManager}>
                    {hub.manager}
                  </td>
                  <td data-label="Stock Health">
                    <div className={styles.healthCell}>
                      <div className={styles.healthBar}>
                        <div
                          className={`${styles.healthFill} ${styles[`health_${variant}`]}`}
                          style={{ width: `${hub.stockHealth}%` }}
                        />
                      </div>
                      <span
                        className={`${styles.healthLabel} ${styles[`healthTxt_${variant}`]}`}
                      >
                        {hub.stockHealth}% {hub.healthLabel}
                      </span>
                    </div>
                  </td>
                  <td
                    data-label="Utilisation"
                    className={styles.utilisationCell}
                  >
                    {hub.utilisation}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className={styles.stateBox}>
        <p className={styles.loadingText}>No warehouse data available</p>
      </div>
    )}
  </div>
);

export default WarehouseAnalytics;
