export type BranchType = "SHOP" | "WAREHOUSE";

export interface Branch {
  id: number;
  name: string;
  phone: string;
  address: string;
  gstin: string | null;
  type: BranchType;
  createdAt: string;
  supportsPickup: boolean;
}

export interface CreateBranchPayload {
  name: string;
  phone: string;
  address: string;
  gstin?: string | null;
  type: BranchType;
  supportsPickup: boolean;
}

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export interface PaginatedBranches {
  data: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BranchListParams {
  type?: BranchType;
  page?: number;
  limit?: number;
}
