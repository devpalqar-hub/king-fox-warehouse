"use client";

import styles from "./dashboard.module.css";
import { useState } from "react";
import type { SalesComparison } from "@/types/dashboard";

interface SalesChartProps {
  data: SalesComparison | null;
  loading?: boolean;
}

const SalesChart = ({ data, loading = false }: SalesChartProps) => {
  const [activeTab, setActiveTab] = useState<"Daily" | "Monthly" | "Yearly">(
    "Daily",
  );

  // ─── Transform API data into chart format ──────────────────────────────────
  const chartData = data
    ? data.labels.map((label, i) => ({
        label,
        online: data.onlineSales[i] || 0,
        offline: data.physicalSales[i] || 0,
      }))
    : [];

  const W = 580;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = chartData.flatMap((d) => [d.online, d.offline]);
  const maxVal = Math.max(...allVals, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const xStep = chartData.length > 1 ? chartW / (chartData.length - 1) : 0;

  const pts = (key: "online" | "offline") =>
    chartData
      .map((d, i) => {
        const x = PAD.left + i * xStep;
        const y = PAD.top + chartH - ((d[key] - minVal) / range) * chartH;
        return `${x},${y}`;
      })
      .join(" ");

  const areaPath = (key: "online" | "offline") => {
    const points = chartData.map((d, i) => ({
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
          {["Daily", "Monthly", "Yearly"].map((tab) => (
            <button
              key={tab}
              className={`${styles.chartTab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() =>
                setActiveTab(tab as "Daily" | "Monthly" | "Yearly")
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading || !data || chartData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p className={styles.loadingText}>
            {loading ? "Loading chart..." : "No data available"}
          </p>
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg}>
            {/* ── Y-axis ticks and labels ── */}
            {yTicks.map((tick) => (
              <g key={`tick-${tick.val}`}>
                <line
                  x1={PAD.left - 4}
                  y1={tick.y}
                  x2={PAD.left}
                  y2={tick.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={tick.y + 3}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                  fontFamily="inherit"
                >
                  {fmt(tick.val)}
                </text>
              </g>
            ))}

            {/* ── Grid lines ── */}
            {yTicks.map((tick) => (
              <line
                key={`grid-${tick.val}`}
                x1={PAD.left}
                y1={tick.y}
                x2={W - PAD.right}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* ── Axis lines ── */}
            <line
              x1={PAD.left}
              y1={PAD.top}
              x2={PAD.left}
              y2={PAD.top + chartH}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1={PAD.left}
              y1={PAD.top + chartH}
              x2={W - PAD.right}
              y2={PAD.top + chartH}
              stroke="#cbd5e1"
              strokeWidth="2"
            />

            {/* ── Areas ── */}
            <path d={areaPath("online")} fill="#6366f1" opacity="0.15" />
            <path d={areaPath("offline")} fill="#f59e0b" opacity="0.15" />

            {/* ── Lines ── */}
            <polyline
              points={pts("online")}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
            />
            <polyline
              points={pts("offline")}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />

            {/* ── X-axis labels ── */}
            {chartData.map((point, i) => (
              <text
                key={`label-${i}`}
                x={PAD.left + i * xStep}
                y={PAD.top + chartH + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                fontFamily="inherit"
              >
                {point.label}
              </text>
            ))}
          </svg>

          {/* ── Legend ── */}
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "#6366f1" }}
              />
              <span>Online Sales</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "#f59e0b" }}
              />
              <span>Physical Sales</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesChart;
