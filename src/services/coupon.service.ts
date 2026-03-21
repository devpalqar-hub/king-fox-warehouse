import { Coupon } from "@/types/coupon";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCoupons = async (): Promise<Coupon[]> => {
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
    return [];
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
