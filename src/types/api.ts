export interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  complaints?: T[];
  users?: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  totalUsers?: number;
  departments?: number;
}

export interface DepartmentStat {
  _id: string;
  total: number;
  resolved: number;
  avgResolutionTime?: number;
}

export interface MonthlyStats {
  _id: { year: number; month: number };
  total: number;
  resolved: number;
}

export interface MonthlyCategoryStats {
  _id: { year: number; month: number; category: string };
  total: number;
}

export interface PriorityDistribution {
  _id: string;
  count: number;
}

export interface StatusDistribution {
  _id: string;
  count: number;
  percentage?: number;
}
