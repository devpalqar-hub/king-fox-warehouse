const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCampaigns = async (filters?: {
  status?: string;
  branchId?: string;
}) => {
  try {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.branchId) params.append("branchId", filters.branchId);

    const url = `${BASE_URL}/v1/lucky-draw/campaigns${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch campaigns");

    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getCampaignById = async (id: number | string) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/lucky-draw/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch campaign");

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createCampaign = async (payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/lucky-draw/campaigns`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) throw new Error("Failed to create campaign");

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateCampaign = async (id: number | string, payload: any) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/lucky-draw/campaigns/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update campaign");

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateCampaignStatus = async (
  id: number | string,
  status: "ACTIVE" | "CLOSED",
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/v1/lucky-draw/campaigns/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!res.ok) throw new Error("Failed to update campaign status");

    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
