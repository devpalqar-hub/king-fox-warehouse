import { Category } from "@/types/category";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem("token");

/* ── Get All Categories ── */
export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${BASE_URL}/v1/categories`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

/* ── Create Category ── */
export const createCategory = async (
  name: string,
  image?: File,
): Promise<Category> => {
  const formData = new FormData();
  formData.append("name", name);
  if (image) formData.append("image", image);

  const res = await fetch(`${BASE_URL}/v1/categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Do NOT set Content-Type when using FormData — browser sets it with boundary
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
};

/* ── Update Category ── */
export const updateCategory = async (
  id: number,
  name: string,
  image?: File,
): Promise<Category> => {
  const formData = new FormData();
  formData.append("name", name);
  if (image) formData.append("image", image);

  const res = await fetch(`${BASE_URL}/v1/categories/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
};

/* ── Delete Category ── */
export const deleteCategory = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/v1/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete category");
};
