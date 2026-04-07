"use client";

import styles from "./dashboard.module.css";
import type { CategoryPerformanceData } from "@/types/dashboard";

interface CategoryPerformanceProps {
  data: CategoryPerformanceData[];
  loading?: boolean;
}

const RADIUS = 54;
const STROKE = 14;
const CIRC = 2 * Math.PI * RADIUS;
const CX = 80;
const CY = 80;

// ─── Color palette for categories ───────────────────────────────────────────
const DEFAULT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

const CategoryPerformance = ({
  data,
  loading = false,
}: CategoryPerformanceProps) => {
  // ─── Assign colors to categories ───────────────────────────────────────────
  const categoriesWithColors: CategoryPerformanceData[] = data.map(
    (cat, idx) => ({
      ...cat,
      color: cat.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }),
  );

  // Build donut segments
  let offset = 0;
  const segments = categoriesWithColors.map((cat) => {
    const dash = (cat.value / 100) * CIRC;
    const gap = CIRC - dash;
    const seg = { ...cat, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const top = categoriesWithColors[0];

  return (
    <div className={styles.catCard}>
      <div className={styles.catHeader}>
        <h2 className={styles.chartTitle}>Category Performance</h2>
        <p className={styles.chartSub}>Share of total GMV</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p className={styles.loadingText}>Loading categories...</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className={styles.catBody}>
          {/* Donut */}
          <div className={styles.donutWrap}>
            <svg viewBox="0 0 160 160" className={styles.donutSvg}>
              {/* Track */}
              <circle
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={STROKE}
              />
              {segments.map((seg) => (
                <circle
                  key={seg.label}
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${seg.dash} ${seg.gap}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              ))}
              {/* Centre label */}
              <text
                x={CX}
                y={CY - 7}
                textAnchor="middle"
                fontSize="22"
                fontWeight="800"
                fill="#0f172a"
                fontFamily="inherit"
              >
                {top.value}%
              </text>
              <text
                x={CX}
                y={CY + 12}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#94a3b8"
                fontFamily="inherit"
                letterSpacing="0.06em"
              >
                TOP CATEGORY
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className={styles.catLegend}>
            {categoriesWithColors.map((cat) => (
              <div key={cat.label} className={styles.catLegendRow}>
                <span
                  className={styles.catDot}
                  style={{ background: cat.color }}
                />
                <div className={styles.catLegendInfo}>
                  <div className={styles.catLabel}>{cat.label}</div>
                  <div className={styles.catValue}>{cat.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p className={styles.loadingText}>No category data available</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPerformance;
