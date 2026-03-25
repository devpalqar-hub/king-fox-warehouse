import { Coupon } from "@/types/coupon";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CouponResponse {
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getCoupons = async (): Promise<CouponResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/v1/coupons`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch coupons");

    return res.json();
  } catch (error) {
    console.error("Coupon fetch error:", error);
    return {
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
};

export const getCouponById = async (id: number): Promise<Coupon> => {
  const res = await fetch(`${BASE_URL}/v1/coupons/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch coupon");

  return res.json();
};

export const createCoupon = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/v1/coupons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create coupon");

  return res.json();
};

export const updateCoupon = async (id: number, payload: any) => {
  const res = await fetch(`${BASE_URL}/v1/coupons/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update coupon");

  return res.json();
};

export const deleteCoupon = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/v1/coupons/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete coupon");
};