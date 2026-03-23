import { Category } from "@/types/category";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCategories = async (): Promise<Category[]> => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/categories`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};


export const createCategory = async (name: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to create category");

  return res.json();
};