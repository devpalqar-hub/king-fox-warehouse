import { Product } from "@/types/product";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProductMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: ProductMeta;
}

export const getProducts = async (
  filters?: ProductFilters,
): Promise<PaginatedProducts> => {
  try {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.brandId) params.append("brandId", filters.brandId);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const url = `${BASE_URL}/v1/products${
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

    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (error) {
    console.error("Product fetch error:", error);
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }
};

export const deleteProduct = async (id: number | string): Promise<void> => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete product");
};

export const getTags = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
};
