import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/types/banner.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getBanners = async (): Promise<Banner[]> => {
  const res = await fetch(`${API_BASE}/v1/banners`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch banners");
  return data;
};

export const getBannerById = async (id: number): Promise<Banner> => {
  const res = await fetch(`${API_BASE}/v1/banners/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch banner");
  return data;
};

export const createBanner = async (
  payload: CreateBannerPayload
): Promise<Banner> => {
  const res = await fetch(`${API_BASE}/v1/banners`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create banner");
  return data;
};

export const updateBanner = async (
  id: number,
  payload: UpdateBannerPayload
): Promise<Banner> => {
  const res = await fetch(`${API_BASE}/v1/banners/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update banner");
  return data;
};

export const deleteBanner = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/v1/banners/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to delete banner");
  }
};