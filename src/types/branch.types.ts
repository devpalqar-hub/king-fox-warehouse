export type BranchType = "SHOP" | "WAREHOUSE";

export interface Branch {
  id: number;
  name: string;
  phone: string;
  address: string;
  type: BranchType;
  createdAt: string;
}

export interface CreateBranchPayload {
  name: string;
  phone: string;
  address: string;
  type: BranchType;
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {}

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
