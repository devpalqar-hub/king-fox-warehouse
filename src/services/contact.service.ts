import type {
  ContactEntry,
  CreateContactPayload,
  CreateContactResponse,
  ContactsResponse,
} from "@/types/contact";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function getContacts(page: number = 1): Promise<ContactsResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found in localStorage");
    throw new Error("No authentication token found");
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/contact-us?page=${page}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch contacts: ${res.status}`);
      throw new Error(`Failed to fetch contacts: ${res.status}`);
    }

    const response: ContactsResponse = await res.json();
    console.log("Contact API response:", response);
    return response;
  } catch (err) {
    console.error("Error fetching contacts:", err);
    throw err;
  }
}

export async function createContact(
  payload: CreateContactPayload,
): Promise<CreateContactResponse> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/contact-us`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Failed to create contact: ${res.status}`);
  return res.json();
}

export async function updateContactStatus(
  id: number,
  status: "NEW" | "RESOLVED",
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/v1/contact-us/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update status");

  return res.json();
}
