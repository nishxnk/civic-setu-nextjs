export const systemRoles = [
  { id: 1, name: 'admin', description: 'Full system access — manage complaints, users, departments, analytics' },
  { id: 2, name: 'worker', description: 'Field worker — view assigned tasks, update status, capture proof' },
  { id: 3, name: 'citizen', description: 'Regular citizen — file complaints, track status, manage profile' },
];

export const isAdminRole = (role?: string): boolean => {
  return role?.toLowerCase() === 'admin';
};

export const isWorkerRole = (role?: string): boolean => {
  return role?.toLowerCase() === 'worker';
};
