import { Product } from "@/types/product";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
}

export const getProducts = async (
  filters?: ProductFilters
): Promise<Product[]> => {
  try {

    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.brandId) params.append("brandId", filters.brandId);

    const url = `${BASE_URL}/v1/products${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();

  } catch (error) {
    console.error("Product fetch error:", error);
    return [];
  }
};

