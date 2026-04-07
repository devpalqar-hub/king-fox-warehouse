const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem("token");

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Get All Tags ── */
export const getTags = async (): Promise<Tag[]> => {
  try {
    const res = await fetch(`${BASE_URL}/v1/tags`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  } catch (error) {
    console.error("Tags fetch error:", error);
    return [];
  }
};

/* ── Create Tag ── */
export const createTag = async (name: string): Promise<Tag> => {
  try {
    const res = await fetch(`${BASE_URL}/v1/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  } catch (error) {
    console.error("Tag creation error:", error);
    throw error;
  }
};
