"use client";

import styles from "./dashboard.module.css";
import { useState, useRef } from "react";

interface Props {
  data: any;
  loading?: boolean;
  onFilterChange?: (filters: any) => void;
}

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
];

type ChartItem = {
  label: string;
  value: number;
};

// ── Chart dimensions ────────────────────────────────────────────────────────
const SVG_W = 620;
const SVG_H = 300;
const MARGIN = { top: 24, right: 24, bottom: 56, left: 68 };
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;
const Y_TICKS = 5;
const BAR_RADIUS = 5;

// ── Helpers ─────────────────────────────────────────────────────────────────
const niceMax = (max: number): number => {
  if (max === 0) return 10;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / exp) * exp;
};

const formatValue = (v: number): string => {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${v}`;
};

const BranchRevenueChart = ({
  data,
  loading = false,
  onFilterChange,
}: Props) => {
  const [range, setRange] = useState<"day" | "month" | "year">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    value: number;
    color: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ── Normalise incoming data ──────────────────────────────────────────────
  const chartData: ChartItem[] = data?.branchReach
    ? data.branchReach.map((b: any, i: number) => ({
        label: b.name || `Branch ${i + 1}`,
        value: Number(b.revenue || 0),
      }))
    : [];

  const rawMax = Math.max(...chartData.map((d) => d.value), 0);
  const yMax = niceMax(rawMax);

  // ── Bar geometry ─────────────────────────────────────────────────────────
  const n = chartData.length || 1;
  const totalBarSpace = CHART_W * 0.7;
  const barW = Math.min(44, totalBarSpace / n);
  const step = CHART_W / n;

  const barX = (i: number) => MARGIN.left + i * step + step / 2 - barW / 2;
  const barY = (v: number) => MARGIN.top + CHART_H - (v / yMax) * CHART_H;
  const barH = (v: number) => (v / yMax) * CHART_H;

  // ── Y-axis ticks ─────────────────────────────────────────────────────────
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) =>
    Math.round((yMax / Y_TICKS) * i),
  );

  const handleApplyFilter = () => {
    onFilterChange?.({ startDate, endDate, range });
  };

  return (
    <div className={styles.chartCard} style={{ overflow: "visible" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.chartHeaderResponsive}>
        <div>
          <h2 className={styles.chartTitle}>Revenue by Branch</h2>
          <p className={styles.chartSub}>
            Compare revenue across warehouse branches
          </p>
        </div>

        {/* Range Tabs */}
        <div className={styles.chartTabs}>
          {(["day", "month", "year"] as const).map((r) => (
            <button
              key={r}
              className={
                range === r
                  ? `${styles.chartTab} ${styles.chartTabActive}`
                  : styles.chartTab
              }
              onClick={() => {
                setRange(r);
                onFilterChange?.({ startDate, endDate, range: r });
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Date Filters ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#374151",
          }}
        />
        <span style={{ color: "#94a3b8", fontSize: 13 }}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#374151",
          }}
        />
        <button
          onClick={handleApplyFilter}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "none",
            background: "#6366f1",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply
        </button>
      </div>

      {/* ── Chart Body ────────────────────────────────────────────────────── */}
      {loading || chartData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#94a3b8",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {loading ? (
            <span>Loading chart…</span>
          ) : (
            <span>No data available</span>
          )}
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Tooltip */}
          {tooltip?.visible && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x + 12,
                top: tooltip.y - 16,
                background: "#1e293b",
                color: "#f8fafc",
                borderRadius: 8,
                padding: "7px 13px",
                fontSize: 12,
                fontWeight: 600,
                pointerEvents: "none",
                zIndex: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                whiteSpace: "nowrap",
                transform: "translateY(-100%)",
              }}
            >
              <div
                style={{ color: tooltip.color, marginBottom: 2, fontSize: 11 }}
              >
                {tooltip.label}
              </div>
              {formatValue(tooltip.value)}
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              {/* Gradient per bar color */}
              {COLORS.map((c, i) => (
                <linearGradient
                  key={i}
                  id={`barGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity="1" />
                  <stop offset="100%" stopColor={c} stopOpacity="0.55" />
                </linearGradient>
              ))}
            </defs>

            {/* ── Grid lines & Y-axis ticks ───────────────────────────── */}
            {yTicks.map((tick) => {
              const ty = MARGIN.top + CHART_H - (tick / yMax) * CHART_H;
              return (
                <g key={tick}>
                  {/* Horizontal grid line */}
                  <line
                    x1={MARGIN.left}
                    y1={ty}
                    x2={MARGIN.left + CHART_W}
                    y2={ty}
                    stroke={tick === 0 ? "#cbd5e1" : "#f1f5f9"}
                    strokeWidth={tick === 0 ? 1.5 : 1}
                    strokeDasharray={tick === 0 ? "0" : "4 3"}
                  />
                  {/* Y tick label */}
                  <text
                    x={MARGIN.left - 8}
                    y={ty + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {formatValue(tick)}
                  </text>
                </g>
              );
            })}

            {/* ── Y-axis line ─────────────────────────────────────────── */}
            <line
              x1={MARGIN.left}
              y1={MARGIN.top}
              x2={MARGIN.left}
              y2={MARGIN.top + CHART_H}
              stroke="#cbd5e1"
              strokeWidth={1.5}
            />

            {/* ── X-axis line ─────────────────────────────────────────── */}
            <line
              x1={MARGIN.left}
              y1={MARGIN.top + CHART_H}
              x2={MARGIN.left + CHART_W}
              y2={MARGIN.top + CHART_H}
              stroke="#cbd5e1"
              strokeWidth={1.5}
            />

            {/* ── Bars ────────────────────────────────────────────────── */}
            {chartData.map((d, i) => {
              const x = barX(i);
              const h = barH(d.value);
              const y = barY(d.value);
              const colorIdx = i % COLORS.length;
              const cx = x + barW / 2;
              const baseY = MARGIN.top + CHART_H;

              return (
                <g key={i}>
                  {/* Shadow / glow underneath bar */}
                  <rect
                    x={x + 3}
                    y={y + 6}
                    width={barW}
                    height={h}
                    fill={COLORS[colorIdx]}
                    opacity={0.12}
                    rx={BAR_RADIUS}
                  />

                  {/* Main bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, 2)}
                    fill={`url(#barGrad${colorIdx})`}
                    rx={BAR_RADIUS}
                    style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => {
                      const svgRect = svgRef.current?.getBoundingClientRect();
                      const scaleX = svgRect ? svgRect.width / SVG_W : 1;
                      const scaleY = svgRect ? svgRect.height / SVG_H : 1;
                      setTooltip({
                        visible: true,
                        x: cx * scaleX,
                        y: y * scaleY,
                        label: d.label,
                        value: d.value,
                        color: COLORS[colorIdx],
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Value label above bar */}
                  {h > 18 && (
                    <text
                      x={cx}
                      y={y - 7}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={COLORS[colorIdx]}
                      fontFamily="inherit"
                    >
                      {formatValue(d.value)}
                    </text>
                  )}

                  {/* X tick mark */}
                  <line
                    x1={cx}
                    y1={baseY}
                    x2={cx}
                    y2={baseY + 5}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                  />

                  {/* X label */}
                  <text
                    x={cx}
                    y={baseY + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                    fontWeight="500"
                    fontFamily="inherit"
                  >
                    {d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label}
                  </text>
                </g>
              );
            })}

            {/* ── Axis labels ─────────────────────────────────────────── */}
            <text
              x={MARGIN.left - 52}
              y={MARGIN.top + CHART_H / 2}
              textAnchor="middle"
              fontSize="11"
              fill="#94a3b8"
              fontFamily="inherit"
              transform={`rotate(-90, ${MARGIN.left - 52}, ${MARGIN.top + CHART_H / 2})`}
            >
              Revenue (₹)
            </text>
            <text
              x={MARGIN.left + CHART_W / 2}
              y={SVG_H - 4}
              textAnchor="middle"
              fontSize="11"
              fill="#94a3b8"
              fontFamily="inherit"
            >
              Branch
            </text>
          </svg>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      {!loading && chartData.length > 0 && (
        <div
          className={styles.colorLegendResponsive}
          style={{ marginTop: 12, gap: 16 }}
        >
          {chartData.map((d, i) => (
            <div key={i} className={styles.colorLegendItem}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "#64748b" }}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchRevenueChart;
