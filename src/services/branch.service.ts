const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getBranches = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/v1/branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch branches");

    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
