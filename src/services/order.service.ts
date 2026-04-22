import {
  OfflineOrderDetail,
  OfflineOrderResponse,
  OrderResponse,
} from "@/types/order.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sourceType?: string;
}): Promise<OrderResponse | null> => {
  try {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.sourceType) query.append("sourceType", params.sourceType);

    const res = await fetch(`${BASE_URL}/v1/admin/orders?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch orders");

    return res.json();
  } catch (error) {
    console.error("Order fetch error:", error);
    return null;
  }
};

export const getOrderSummary = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/admin/orders/summary`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch summary");

    return res.json();
  } catch (error) {
    console.error("Summary error:", error);
    return null;
  }
};

export const getOrderById = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/admin/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch order");

    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOfflineOrders = async (params?: {
  page?: number;
  limit?: number;
  // status?: string;
  sourceType?: string;
  search?: string;
}): Promise<OfflineOrderResponse | null> => {
  try {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    // if (params?.status) query.append("status", params.status);
    if (params?.sourceType) query.append("sourceType", params.sourceType);
    if (params?.search) {
      query.append("search", params.search);
    }

    const res = await fetch(
      `${BASE_URL}/v1/admin/orders/offline?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch offline orders");

    return res.json();
  } catch (error) {
    console.error("Offline order fetch error:", error);
    return null;
  }
};

export const getOfflineOrderById = async (
  id: number,
): Promise<OfflineOrderDetail | null> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/admin/orders/offline/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch offline order");

    return res.json();
  } catch (error) {
    console.error("Offline order detail fetch error:", error);
    return null;
  }
};
export const updateOrderStatus = async (
  id: number,
  body: Record<string, unknown>,
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json(); // 👈 ADD THIS

    if (!res.ok) {
      console.error("API ERROR:", data); // 🔥 see real reason
      throw new Error(data.message || "Failed to update order");
    }

    return data;
  } catch (error) {
    console.error("Update error:", error);
    return null;
  }
};

export const updateTracking = async (
  id: number,
  body: {
    providerName: string;
    trackingId: string;
    trackingUrl: string;
  },
) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/admin/orders/${id}/tracking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Tracking API error:", data);
      throw new Error(data.message || "Failed to update tracking");
    }

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
