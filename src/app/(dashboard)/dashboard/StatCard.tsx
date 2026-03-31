"use client";

import styles from "./dashboard.module.css";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeVariant?: "green" | "blue" | "orange" | "red";
  trend?: number; // percentage, positive = up, negative = down
  trendLabel?: string;
  accent?: "blue" | "green" | "orange" | "red";
  extra?: ReactNode; // progress bar, ratio bar, etc.
}

const StatCard = ({
  icon,
  label,
  value,
  badge,
  badgeVariant = "green",
  trend,
  trendLabel,
  accent = "blue",
  extra,
}: StatCardProps) => {
  const isUp = trend !== undefined && trend >= 0;

  return (
    <div className={`${styles.statCard} ${styles[`statAccent_${accent}`]}`}>
      {/* Top row */}
      <div className={styles.statTop}>
        <div className={`${styles.statIcon} ${styles[`iconBg_${accent}`]}`}>
          {icon}
        </div>
        {badge && (
          <span
            className={`${styles.statBadge} ${styles[`badge_${badgeVariant}`]}`}
          >
            {badge}
          </span>
        )}
        {trend !== undefined && (
          <span
            className={`${styles.statTrend} ${isUp ? styles.trendUp : styles.trendDown}`}
          >
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className={styles.statValue}>{value}</div>

      {/* Label */}
      <div className={styles.statLabel}>{label}</div>

      {/* Extra slot (progress bars, sub text etc.) */}
      {extra && <div className={styles.statExtra}>{extra}</div>}

      {trendLabel && <div className={styles.statSub}>{trendLabel}</div>}
    </div>
  );
};

export default StatCard;
