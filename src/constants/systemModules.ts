export const systemModules: {
  id: string;
  name: string;
  description: string;
  icon: string;
  roles: string[];
}[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview and statistics',
    icon: 'LayoutDashboard',
    roles: ['admin', 'citizen', 'worker'],
  },
  {
    id: 'complaints',
    name: 'Complaints',
    description: 'Manage civic complaints',
    icon: 'FileText',
    roles: ['admin', 'citizen'],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Charts, trends, and reports',
    icon: 'BarChart3',
    roles: ['admin'],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management',
    icon: 'Users',
    roles: ['admin'],
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Department management',
    icon: 'Building2',
    roles: ['admin'],
  },
  {
    id: 'assets',
    name: 'Assets',
    description: 'Infrastructure asset registry',
    icon: 'Building2',
    roles: ['admin'],
  },
  {
    id: 'tasks',
    name: 'My Tasks',
    description: 'Assigned work orders',
    icon: 'ClipboardList',
    roles: ['worker'],
  },
  {
    id: 'inspections',
    name: 'Inspections',
    description: 'Scheduled inspection management',
    icon: 'ClipboardCheck',
    roles: ['admin', 'worker'],
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Manage your profile',
    icon: 'UserCircle',
    roles: ['admin', 'citizen', 'worker'],
  },
];
