import type {
  Branch,
  BranchListParams,
  CreateBranchPayload,
  PaginatedBranches,
  UpdateBranchPayload,
} from "@/types/branch.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const token = localStorage.getItem("token");

export async function getBranches(
  params: BranchListParams = {},
): Promise<Branch[]> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));

  const url = `${BASE_URL}/v1/branches${query.toString() ? `?${query}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch branches: ${res.status}`);

  const json = await res.json();


  return Array.isArray(json) ? json : json.data || [];
}

/** GET /v1/branches/:id */
export async function getBranch(id: number): Promise<Branch> {
  const res = await fetch(`${BASE_URL}/v1/branches/${id}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch branch: ${res.status}`);
  return res.json();
}

/** POST /v1/branches */
export async function createBranch(
  payload: CreateBranchPayload,
): Promise<Branch> {
  const res = await fetch(`${BASE_URL}/v1/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create branch: ${res.status}`);
  return res.json();
}

/** PATCH /v1/branches/:id */
export async function updateBranch(
  id: number,
  payload: UpdateBranchPayload,
): Promise<Branch> {
  const res = await fetch(`${BASE_URL}/v1/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update branch: ${res.status}`);
  return res.json();
}

/** DELETE /v1/branches/:id */
export async function deleteBranch(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/branches/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to delete branch: ${res.status}`);
}
