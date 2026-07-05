export const route_constants = {
  // Public
  home: '/',
  about: '/about',
  contact: '/contact',
  login: '/login',
  signup: '/signup',

  // Citizen
  citizenDashboard: '/citizen/dashboard',
  citizenReport: '/citizen/report',
  citizenComplaints: '/citizen/complaints',
  citizenComplaintById: (id: string) => `/citizen/complaints/${id}`,
  citizenProfile: '/citizen/profile',

  // Admin
  adminDashboard: '/admin/dashboard',
  adminComplaints: '/admin/complaints',
  adminComplaintById: (id: string) => `/admin/complaints/${id}`,
  adminAnalytics: '/admin/analytics',
  adminUsers: '/admin/users',
  adminDepartments: '/admin/departments',

  // Worker
  workerDashboard: '/worker/dashboard',
  workerTaskById: (id: string) => `/worker/tasks/${id}`,

  // Notifications
  notifications: '/notifications',
} as const;
