import { User } from "../types/user.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

    return res.json();
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
      throw new Error("Failed to create user");
    }

    return res.json();
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const updateUser = async (id: number, payload: {
  name: string;
  email: string;
  password?: string;
  roleId: number;
  branchId: number | null;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update user");

  return res.json();
};