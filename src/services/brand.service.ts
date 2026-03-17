import { Brand } from "@/types/brand";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getBrands = async (): Promise<Brand[]> => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/brands`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch brands");
  }

  return res.json();
};