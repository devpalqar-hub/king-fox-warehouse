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

export const getCoupons = async (): Promise<CouponResponse> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/coupons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch coupons");
    }

    return res.json();
  } catch (error) {
    console.error("Coupon fetch error:", error);

    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }
};

export const createCoupon = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/coupons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to create coupon");
    }

    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
