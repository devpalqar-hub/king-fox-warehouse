export interface StaffPerformanceRanking {
  id: string;
  name: string;
  role: string;
  branch: string;
  revenue: number;
}

export interface StaffPerformancePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffPerformanceResponse {
  topPerformer: string;
  totalRevenue: number;
  activePersonnel: number;
  rankings: StaffPerformanceRanking[];
  pagination: StaffPerformancePagination;
}

export interface StaffPerformanceParams {
  page?: number;
  limit?: number;
  branchId?: number;
}
