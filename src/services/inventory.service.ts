import { InventoryVariant } from "@/types/variant";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface InventoryFilters {
  search?: string;
  categoryId?: string;
  page?: number;
}

export const getInventory = async (
  filters?: InventoryFilters,
): Promise<InventoryVariant[]> => {
  try {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.page) params.append("page", String(filters.page));

    const url = `${BASE_URL}/v1/products/variants${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch inventory");
    }

    return res.json().then((res) => res.data || res);
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return [];
  }
};

export const getVariantStock = async (variantId: number) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/v1/products/variants/${variantId}/stock`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch stock");

    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addStock = async (payload: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/stock-transfers/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to add stock");

  return res.json();
};

export const transferStock = async (payload: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/stock-transfers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Transfer failed");

  return res.json();
};

export const returnStock = async (payload: {
  inventoryId: number;
  variantId: number;
  stockCount: number;
  note?: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/inventory/return-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Return stock failed");

  return res.json();
};
