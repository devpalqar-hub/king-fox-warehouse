export type Role = {
  id: number;
  name: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✅ GET ROLES
export const getRoles = async (): Promise<Role[]> => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch roles");
    }

    return res.json();
  } catch (error) {
    console.error("Role fetch error:", error);
    return [];
  }
};