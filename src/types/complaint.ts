export type ComplaintCategory =
  | "road" | "lighting" | "water" | "sanitation" | "traffic" | "other";

export type ComplaintDepartment =
  | "pwd" | "electricity" | "water" | "sanitation" | "traffic" | "parks";

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "rejected" | "verified" | "closed";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export interface ICitizenInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ILocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department: ComplaintDepartment;
  location: ILocation;
  citizen: ICitizenInfo;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  attachments: string[];
  assignedTo?: string;
  trackingNumber: string;
  resolutionNotes?: string;
  resolutionDate?: string;
  // Enhanced workflow
  assetId?: string;
  checklist?: Array<{ task: string; completed: boolean; completedAt?: string; completedBy?: string }>;
  beforePhoto?: string;
  afterPhoto?: string;
  startedAt?: string;
  completedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  // SLA
  slaDeadline?: string;
  slaBreached?: boolean;
  escalationLevel?: number;
  createdAt: string;
  updatedAt: string;
}
