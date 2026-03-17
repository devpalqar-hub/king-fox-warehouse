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
