"use client";

import styles from "./coupons.module.css";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCoupons } from "@/services/coupon.service";
import { Coupon } from "@/types/coupon";

const CouponsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await getCoupons();
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setCoupons([]);
      }
    };

    fetchCoupons();
  }, []);

  const getDiscountLabel = (c: Coupon) => {
    if (c.discountType === "PERCENTAGE") {
      return `${c.discountValue}% Discount`;
    }
    return `₹${c.discountValue} Fixed`;
  };

  const getStatus = (c: Coupon) => {
    const now = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);

    if (now < start) return "scheduled";
    if (now > end) return "expired";
    return "active";
  };

  const filteredCoupons = coupons.filter((c) => {
    const status = getStatus(c);
    return activeTab === "all" || status === activeTab;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Coupon Management</h1>
          <p>Create, monitor, and analyze discount campaigns</p>
        </div>

        <Link href="/coupons/create" className={styles.btnPrimary}>
          <Plus size={18} /> Create New Coupon
        </Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["active", "expired", "scheduled"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Campaigns
          </button>
        ))}
      </div>

      {/* Table */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>COUPON CODE</th>
              <th>TYPE & VALUE</th>
              <th>USAGE</th>
              <th>VALIDITY</th>
              <th>STATUS</th>
              {/* <th>ACTION</th> */}
            </tr>
          </thead>

          <tbody>
            {filteredCoupons.map((c) => {
              const percent = c.usageLimit
                ? Math.round((c.usedCount / c.usageLimit) * 100)
                : 0;

              const status = getStatus(c);

              return (
                <tr key={c.id}>
                  <td>
                    <div className={styles.codeCell}>
                      <span className={styles.code}>{c.code}</span>
                      <p>{c.description}</p>
                    </div>
                  </td>

                  <td>{getDiscountLabel(c)}</td>

                  <td>
                    <div className={styles.progressWrapper}>
                      <span>
                        {c.usedCount}/{c.usageLimit ?? "∞"} used
                      </span>

                      <div className={styles.progressBar}>
                        <div
                          style={{ width: `${percent}%` }}
                          className={styles.progressFill}
                        />
                      </div>

                      <span>{percent}%</span>
                    </div>
                  </td>

                  <td>
                    Ends {new Date(c.endDate).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        status === "active"
                          ? styles.active
                          : status === "expired"
                            ? styles.expired
                            : styles.scheduled
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.pagination}>
          Showing {filteredCoupons.length} coupons
        </div>
      </section>
    </div>
  );
};

export default CouponsPage;
