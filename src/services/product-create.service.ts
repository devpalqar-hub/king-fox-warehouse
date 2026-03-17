const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createProduct = async (data: any) => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "Failed to create product");
  }

  return response;
};