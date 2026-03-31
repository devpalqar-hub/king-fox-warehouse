"use client";

import styles from "./dashboard.module.css";

// Mock data — replace with API
const MOCK_CATEGORIES = [
  { label: "Ethnic Wear", value: 42, color: "#6366f1" },
  { label: "T-Shirts", value: 28, color: "#22c55e" },
  { label: "Jeans", value: 18, color: "#f59e0b" },
  { label: "Others", value: 12, color: "#e2e8f0" },
];

const RADIUS = 54;
const STROKE = 14;
const CIRC = 2 * Math.PI * RADIUS;
const CX = 80;
const CY = 80;

const CategoryPerformance = () => {
  // Build donut segments
  let offset = 0;
  const segments = MOCK_CATEGORIES.map((cat) => {
    const dash = (cat.value / 100) * CIRC;
    const gap = CIRC - dash;
    const seg = { ...cat, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const top = MOCK_CATEGORIES[0];

  return (
    <div className={styles.catCard}>
      <div className={styles.catHeader}>
        <h2 className={styles.chartTitle}>Category Performance</h2>
        <p className={styles.chartSub}>Share of total GMV</p>
      </div>

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
              APPAREL TOP
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className={styles.catLegend}>
          {MOCK_CATEGORIES.map((cat) => (
            <div key={cat.label} className={styles.catLegendRow}>
              <span
                className={styles.catDot}
                style={{ background: cat.color }}
              />
              <span className={styles.catLegendLabel}>{cat.label}</span>
              <span className={styles.catLegendValue}>{cat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformance;
