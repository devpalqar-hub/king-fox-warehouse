// ─── Overview / Stats ───────────────────────────────────────────────────────
export interface Revenue {
  total: number;
  growth: number;
}

export interface DigitalVsPhysical {
  online: number;
  physical: number;
  label: string;
}

export interface Orders {
  total: number;
  onlineCount: number;
  offlineCount: number;
}

export interface DashboardOverview {
  revenue: Revenue;
  digitalVsPhysical: DigitalVsPhysical;
  orders: Orders;
  warehouseHealth: number;
}

// ─── Latest Feedback ────────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  stars: number;
  productName: string;
  feedback: string;
  timeAgo: string;
}

// ─── Recent Orders ──────────────────────────────────────────────────────────
export interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  date: string;
}

// ─── Sales Comparison ───────────────────────────────────────────────────────
export interface SalesComparison {
  labels: string[];
  onlineSales: number[];
  physicalSales: number[];
}

// ─── Warehouse Analytics ────────────────────────────────────────────────────
export interface WarehouseData {
  id: string;
  location: string;
  manager: string;
  stockHealth: number;
  healthLabel: string;
  utilisation: number;
}

// ─── Category Performance ───────────────────────────────────────────────────
export interface CategoryPerformanceData {
  label: string;
  value: number;
  color?: string;
}

// ─── Top Categories ─────────────────────────────────────────────────────────
export interface TopCategory {
  id: string;
  name: string;
  value: number;
}
