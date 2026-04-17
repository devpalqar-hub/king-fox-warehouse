import type {
  StaffPerformancePagination,
  StaffPerformanceParams,
  StaffPerformanceRanking,
  StaffPerformanceResponse,
} from "@/types/staff-performance.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getResponseMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) return data;

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return null;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeRanking = (value: unknown): StaffPerformanceRanking => {
  const ranking =
    value && typeof value === "object"
      ? (value as Partial<StaffPerformanceRanking>)
      : {};

  return {
    id: String(ranking.id ?? ""),
    name: typeof ranking.name === "string" ? ranking.name : "",
    role: typeof ranking.role === "string" ? ranking.role : "",
    branch: typeof ranking.branch === "string" ? ranking.branch : "",
    revenue: toFiniteNumber(ranking.revenue, 0),
  };
};

const normalizePagination = (
  value: unknown,
  params: StaffPerformanceParams,
): StaffPerformancePagination => {
  const fallbackPage = params.page ?? DEFAULT_PAGE;
  const fallbackLimit = params.limit ?? DEFAULT_LIMIT;
  const pagination =
    value && typeof value === "object"
      ? (value as Partial<StaffPerformancePagination>)
      : {};

  const total = Math.max(0, toFiniteNumber(pagination.total, 0));
  const page = Math.max(1, toFiniteNumber(pagination.page, fallbackPage));
  const limit = Math.max(1, toFiniteNumber(pagination.limit, fallbackLimit));
  const derivedTotalPages = Math.max(1, Math.ceil(total / limit));
  const totalPages = Math.max(
    1,
    toFiniteNumber(pagination.totalPages, derivedTotalPages),
  );

  return {
    total,
    page,
    limit,
    totalPages,
  };
};

const extractPayload = (data: unknown) => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    data.data &&
    typeof data.data === "object"
  ) {
    return data.data;
  }

  return data;
};

export const getStaffPerformance = async (
  params: StaffPerformanceParams = {},
): Promise<StaffPerformanceResponse> => {
  const token = getToken();

  if (!token) {
    throw new Error("You need to log in again before viewing staff performance.");
  }

  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (params.branchId != null) {
    query.set("branchId", String(params.branchId));
  }

  const response = await fetch(
    `${BASE_URL}/v1/admin-dashboard/app/staff-performance?${query.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getResponseMessage(body) ?? "Failed to fetch staff performance.",
    );
  }

  const payload = extractPayload(body);
  const data =
    payload && typeof payload === "object"
      ? (payload as Partial<StaffPerformanceResponse>)
      : {};

  return {
    topPerformer:
      typeof data.topPerformer === "string" ? data.topPerformer : "",
    totalRevenue: toFiniteNumber(data.totalRevenue, 0),
    activePersonnel: toFiniteNumber(data.activePersonnel, 0),
    rankings: Array.isArray(data.rankings)
      ? data.rankings.map(normalizeRanking).filter((ranking) => ranking.id)
      : [],
    pagination: normalizePagination(data.pagination, { page, limit }),
  };
};
