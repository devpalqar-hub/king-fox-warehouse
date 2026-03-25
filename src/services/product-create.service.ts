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

  console.log("API RESPONSE:", response); // ✅ debug

  if (!res.ok) {
    throw new Error(response.message || "Failed to create product");
  }

  return response;
};

export const createVariant = async (productId: number, data: any) => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products/${productId}/variants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  console.log("VARIANT API RESPONSE:", response);

  if (!res.ok) {
    throw new Error(response.message || "Failed to create variant");
  }

  return response;
};

export const getProductById = async (id: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch product");
  }

  return data; // ✅ SINGLE OBJECT
};

export const getVariantsByProductId = async (productId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products/${productId}/variants`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  console.log("GET VARIANTS RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch variants");
  }

  return data;
};


export const updateProduct = async (id: number, data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "Failed to update product");
  }

  return response;
};

export const getCategories = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data;
};


export const updateVariant = async (variantId: number, data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/v1/products/variants/${variantId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "Failed to update variant");
  }

  return response;
};