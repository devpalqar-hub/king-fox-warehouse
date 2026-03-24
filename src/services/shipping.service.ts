const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getShippingConfig = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/admin/shipping/config`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch config");

  return res.json();
};

export const getShippingRates = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/admin/shipping/rates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch rates");

  return res.json();
};

export const createShippingRate = async (payload: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/shipping/rates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) throw new Error("Failed to create shipping rate");

  return res.json();
};

export const updateShippingConfig = async (defaultCharge: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/shipping/config`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ defaultCharge }),
    },
  );

  if (!res.ok) throw new Error("Failed to update shipping config");

  return res.json();
};
