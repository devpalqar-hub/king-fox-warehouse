"use client";

import styles from "./dashboard.module.css";
import { MapPin } from "lucide-react";
import Link from "next/link";

// Mock data — replace with API
const MOCK_HUBS = [
  {
    id: 1,
    location: "Kochi Hub",
    manager: "Rahul Nair",
    healthPct: 88,
    healthLabel: "Healthy",
    healthVariant: "healthy",
    utilisation: 92,
  },
  {
    id: 2,
    location: "Mumbai Center",
    manager: "Anita Sharma",
    healthPct: 64,
    healthLabel: "Low Stock",
    healthVariant: "lowstock",
    utilisation: 78,
  },
  {
    id: 3,
    location: "Delhi Warehouse",
    manager: "Vikram Singh",
    healthPct: 94,
    healthLabel: "Healthy",
    healthVariant: "healthy",
    utilisation: 85,
  },
];

const WarehouseAnalytics = () => (
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
        {MOCK_HUBS.map((hub) => (
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
                    className={`${styles.healthFill} ${styles[`health_${hub.healthVariant}`]}`}
                    style={{ width: `${hub.healthPct}%` }}
                  />
                </div>
                <span
                  className={`${styles.healthLabel} ${styles[`healthTxt_${hub.healthVariant}`]}`}
                >
                  {hub.healthPct}% {hub.healthLabel}
                </span>
              </div>
            </td>
            <td className={styles.utilisationCell}>{hub.utilisation}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WarehouseAnalytics;
