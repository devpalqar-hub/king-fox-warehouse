export interface ContactEntry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactsResponse {
  data: ContactEntry[];
  meta: PaginationMeta;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CreateContactResponse {
  message: string;
  id: number;
}
