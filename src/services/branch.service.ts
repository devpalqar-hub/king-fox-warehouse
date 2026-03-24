const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const getBranches = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/v1/branches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
};