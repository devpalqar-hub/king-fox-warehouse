import type {
  ContactEntry,
  CreateContactPayload,
  CreateContactResponse,
} from "@/types/contact";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function getContacts(): Promise<ContactEntry[]> {
  const token = localStorage.getItem("token"); // or wherever you store it

  const res = await fetch(`${BASE_URL}/v1/contact-us`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.status}`);
  return res.json();
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
