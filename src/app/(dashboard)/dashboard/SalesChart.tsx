"use client";

import styles from "./dashboard.module.css";
import { useState } from "react";

// Mock data — replace with API later
const MOCK_DATA: Record<
  string,
  { label: string; online: number; offline: number }[]
> = {
  Daily: [
    { label: "Mon", online: 42000, offline: 28000 },
    { label: "Tue", online: 38000, offline: 32000 },
    { label: "Wed", online: 55000, offline: 25000 },
    { label: "Thu", online: 47000, offline: 30000 },
    { label: "Fri", online: 62000, offline: 22000 },
    { label: "Sat", online: 71000, offline: 35000 },
    { label: "Sun", online: 58000, offline: 27000 },
  ],
  Monthly: [
    { label: "Jan", online: 320000, offline: 210000 },
    { label: "Feb", online: 280000, offline: 240000 },
    { label: "Mar", online: 410000, offline: 190000 },
    { label: "Apr", online: 370000, offline: 220000 },
    { label: "May", online: 450000, offline: 180000 },
    { label: "Jun", online: 520000, offline: 160000 },
  ],
  Yearly: [
    { label: "2020", online: 2100000, offline: 1800000 },
    { label: "2021", online: 2800000, offline: 1600000 },
    { label: "2022", online: 3400000, offline: 1400000 },
    { label: "2023", online: 3900000, offline: 1200000 },
    { label: "2024", online: 4284500, offline: 1100000 },
  ],
};

const TABS = ["Daily", "Monthly", "Yearly"] as const;

const SalesChart = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Daily");
  const data = MOCK_DATA[activeTab];

  const W = 580;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.online, d.offline]);
  const maxVal = Math.max(...allVals);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const xStep = chartW / (data.length - 1);

  const pts = (key: "online" | "offline") =>
    data
      .map((d, i) => {
        const x = PAD.left + i * xStep;
        const y = PAD.top + chartH - ((d[key] - minVal) / range) * chartH;
        return `${x},${y}`;
      })
      .join(" ");

  const areaPath = (key: "online" | "offline") => {
    const points = data.map((d, i) => ({
      x: PAD.left + i * xStep,
      y: PAD.top + chartH - ((d[key] - minVal) / range) * chartH,
    }));
    const baseline = PAD.top + chartH;
    const d =
      `M${points[0].x},${baseline} ` +
      points.map((p) => `L${p.x},${p.y}`).join(" ") +
      ` L${points[points.length - 1].x},${baseline} Z`;
    return d;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: Math.round(minVal + t * range),
    y: PAD.top + chartH - t * chartH,
  }));

  const fmt = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)}k`
        : String(n);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>Sales Comparison</h2>
          <p className={styles.chartSub}>Online Store vs Physical Outlets</p>
        </div>
        <div className={styles.chartTabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.chartTab} ${activeTab === t ? styles.chartTabActive : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartSvgWrap}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className={styles.chartSvg}
        >
          <defs>
            <linearGradient id="gradOnline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradOffline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {yTicks.map((tk) => (
            <g key={tk.y}>
              <line
                x1={PAD.left}
                y1={tk.y}
                x2={W - PAD.right}
                y2={tk.y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 6}
                y={tk.y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="inherit"
              >
                {fmt(tk.val)}
              </text>
            </g>
          ))}

          {/* X labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={PAD.left + i * xStep}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#94a3b8"
              fontFamily="inherit"
            >
              {d.label}
            </text>
          ))}

          {/* Areas */}
          <path d={areaPath("offline")} fill="url(#gradOffline)" />
          <path d={areaPath("online")} fill="url(#gradOnline)" />

          {/* Lines */}
          <polyline
            points={pts("offline")}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={pts("online")}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots for online */}
          {data.map((d, i) => {
            const x = PAD.left + i * xStep;
            const y = PAD.top + chartH - ((d.online - minVal) / range) * chartH;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="#6366f1"
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className={styles.chartLegend}>
        <span className={styles.legendDot} style={{ background: "#6366f1" }} />
        <span className={styles.legendLabel}>Online Sales</span>
        <span className={styles.legendDot} style={{ background: "#cbd5e1" }} />
        <span className={styles.legendLabel}>Offline Outlets</span>
      </div>
    </div>
  );
};

export default SalesChart;
