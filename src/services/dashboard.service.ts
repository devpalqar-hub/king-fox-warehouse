import {
  DashboardOverview,
  Feedback,
  RecentOrder,
  SalesComparison,
  WarehouseData,
  CategoryPerformanceData,
  TopCategory,
} from "@/types/dashboard";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/app/top-categories
// ─────────────────────────────────────────────────────────────────────────────
export const getTopCategories = async (): Promise<TopCategory[]> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${BASE_URL}/v1/admin-dashboard/app/top-categories`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/category-performance
// ─────────────────────────────────────────────────────────────────────────────
export const getCategoryPerformance = async (): Promise<
  CategoryPerformanceData[]
> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${BASE_URL}/v1/admin-dashboard/category-performance`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching category performance:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/latest-feedback
// ─────────────────────────────────────────────────────────────────────────────
export const getLatestFeedback = async (): Promise<Feedback[]> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/v1/admin-dashboard/latest-feedback`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching latest feedback:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/overview
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardOverview =
  async (): Promise<DashboardOverview | null> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/v1/admin-dashboard/overview`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      return null;
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/recent-orders
// ─────────────────────────────────────────────────────────────────────────────
export const getRecentOrders = async (): Promise<RecentOrder[]> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/v1/admin-dashboard/recent-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/sales-comparison?range=1
// ─────────────────────────────────────────────────────────────────────────────
export const getSalesComparison = async (
  range: number = 1,
): Promise<SalesComparison | null> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${BASE_URL}/v1/admin-dashboard/sales-comparison?range=${range}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching sales comparison:", error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/admin-dashboard/warehouse-analytics
// ─────────────────────────────────────────────────────────────────────────────
export const getWarehouseAnalytics = async (): Promise<WarehouseData[]> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${BASE_URL}/v1/admin-dashboard/warehouse-analytics`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching warehouse analytics:", error);
    return [];
  }
};
