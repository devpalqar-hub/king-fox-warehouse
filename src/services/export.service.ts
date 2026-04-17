const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ExportType =
  | "INVOICES"
  | "VOUCHERS"
  | "STOCK"
  | "STAFF_PERFORMANCE";

export type ExportFormat = "PDF" | "EXCEL";

type StoredBranchRef =
  | number
  | string
  | {
      id?: number | string | null;
    };

type StoredUser = {
  email?: string | null;
  branch?: {
    id?: number | string | null;
  } | null;
  branchId?: number | string | null;
  branches?: StoredBranchRef[] | null;
  branchIds?: Array<number | string> | null;
};

export interface ExportRequestPayload {
  type: ExportType;
  format: ExportFormat;
  startDate: string;
  endDate: string;
  email?: string;
  branchIds?: number[];
}

interface ExportApiPayload {
  type: ExportType;
  format: ExportFormat;
  email: string;
  branchIds: number[];
  startDate: string;
  endDate: string;
}

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
};

const toBranchId = (value: unknown): number | null => {
  if (value == null) return null;

  if (typeof value === "object") {
    return toBranchId((value as { id?: unknown }).id);
  }

  const branchId = Number(value);
  return Number.isFinite(branchId) && branchId > 0 ? branchId : null;
};

const dedupeBranchIds = (branchIds: Array<number | null | undefined>) =>
  Array.from(
    new Set(
      branchIds.filter((branchId): branchId is number =>
        typeof branchId === "number",
      ),
    ),
  );

const extractStoredBranchIds = (user: StoredUser | null) => {
  if (!user) return [];

  const storedBranchIds = [
    ...(user.branchIds ?? []),
    ...(user.branches ?? []),
    user.branch,
    user.branchId,
  ];

  return dedupeBranchIds(storedBranchIds.map(toBranchId));
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

const fetchAllBranchIds = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("You need to log in again before requesting an export.");
  }

  const response = await fetch(`${BASE_URL}/v1/branches`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getResponseMessage(data) ?? "Failed to resolve branches for export.",
    );
  }

  const branches = Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: unknown[] } | null)?.data)
      ? (data as { data: unknown[] }).data
      : [];

  return dedupeBranchIds(branches.map(toBranchId));
};

const resolveExportContext = async (payload: ExportRequestPayload) => {
  const user = getStoredUser();
  const email = payload.email?.trim() || user?.email?.trim();

  if (!email) {
    throw new Error("No user email was found for this export request.");
  }

  const providedBranchIds = dedupeBranchIds(
    (payload.branchIds ?? []).map((branchId) => toBranchId(branchId)),
  );

  const branchIds = providedBranchIds.length
    ? providedBranchIds
    : extractStoredBranchIds(user);

  if (branchIds.length) {
    return { email, branchIds };
  }

  const allBranchIds = await fetchAllBranchIds();

  if (!allBranchIds.length) {
    throw new Error("No branches are available for this export request.");
  }

  return { email, branchIds: allBranchIds };
};

export const formatExportDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid export date.");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getCurrentYearExportRange = () => {
  const today = new Date();

  return {
    startDate: `${today.getFullYear()}-01-01`,
    endDate: formatExportDate(today),
  };
};

export const requestExport = async (payload: ExportRequestPayload) => {
  const token = getToken();

  if (!token) {
    throw new Error("You need to log in again before requesting an export.");
  }

  const { email, branchIds } = await resolveExportContext(payload);

  const body: ExportApiPayload = {
    type: payload.type,
    format: payload.format,
    email,
    branchIds,
    startDate: payload.startDate,
    endDate: payload.endDate,
  };

  const response = await fetch(`${BASE_URL}/v1/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getResponseMessage(data) ?? "Failed to request export.");
  }

  return data;
};
