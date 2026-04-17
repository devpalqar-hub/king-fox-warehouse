import { User } from "../types/user.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✅ GET USERS WITH PAGINATION
export const getUsersWithPagination = async (params?: {
  page?: number;
  limit?: number;
  roleId?: number;
  branchId?: number;
}) => {
  try {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.roleId) query.append("roleId", String(params.roleId));
    if (params?.branchId) query.append("branchId", String(params.branchId));

    const res = await fetch(`${BASE_URL}/v1/users?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch users");

    return res.json();
  } catch (error) {
    console.error("User fetch error:", error);
    return null;
  }
};

// ✅ GET USERS
export const getUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("User fetch error:", error);
    return [];
  }
};

// ✅ CREATE USER
export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
  branchId: number | null;
}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const error = new Error(errorData.message || "Failed to create user");
      (error as any).statusCode = res.status;
      throw error;
    }

    return res.json();
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const updateUser = async (
  id: number,
  payload: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    roleId: number;
    branchId: number | null;
  },
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/users/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) throw new Error("Failed to update user");

  return res.json();
};

// ✅ DELETE USER
export const deleteUser = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to delete user");
    }

    return res.json();
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};
