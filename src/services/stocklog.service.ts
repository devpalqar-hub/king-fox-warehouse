// services/stocklog.service.ts

export type StockLogFilterType = "ALL" | "NEW_STOCK" | "TRANSFER";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface StockLogEntry {
  id: number;
  user: {
    name: string;
    role: string;
  };
  type: string; 
  productSku: string;
  branch: string;
  amount: number;
  date: string; 
  time: string; 
  rawCreatedAt: string;
}

export interface StockLogSummary {
  totalEntries: number;
  newStockAdded: number;
  transfersMade: number;
}

export interface StockLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StockLogResponse {
  summary: StockLogSummary;
  data: StockLogEntry[];
  pagination: StockLogPagination;
}

export interface StockLogParams {
  page?: number;
  limit?: number;
  search?: string;
  filterType?: StockLogFilterType;
}

export async function fetchStockLogs(
  params: StockLogParams = {},
): Promise<StockLogResponse> {
  const { page = 1, limit = 20, search = "", filterType = "ALL" } = params;

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));
  if (search.trim()) query.set("search", search.trim());
  if (filterType !== "ALL") query.set("filterType", filterType);

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/inventory/logs?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as { message?: string }).message ??
        `Failed to fetch stock logs (${res.status})`,
    );
  }

  return res.json() as Promise<StockLogResponse>;
}
