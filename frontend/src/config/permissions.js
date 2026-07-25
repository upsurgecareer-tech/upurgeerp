// Role-based permissions config
// Roles match exact DB role names (lowercase comparison)

export const ROLE_PERMISSIONS = {
  'super admin':   ['*'],           // Full access to everything
  'branch admin':  ['dashboard', 'crm', 'students', 'lms', 'hrms', 'reports', 'admin'],
  'faculty':       ['dashboard', 'students', 'lms'],
  'counsellor':    ['dashboard', 'crm', 'students'],
  'cashier':       ['dashboard', 'students', 'reports'],
  'hr manager':    ['hrms', 'reports'],
};

// Check if a user has access to a menu section
export const hasAccess = (roleName, section) => {
  if (!roleName) return true; // fallback: show all if no role (shouldn't happen)
  const role = roleName.toLowerCase().trim();
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return true; // unknown role: show all
  if (permissions.includes('*')) return true;  // super admin
  return permissions.includes(section);
};

// Get current user's role from localStorage
export const getCurrentRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (user.role_name || '').toLowerCase().trim();
  } catch {
    return '';
  }
};

// Check if current user is admin (Super Admin or Branch Admin)
export const isAdmin = () => {
  const role = getCurrentRole();
  return role === 'super admin' || role === 'branch admin';
};

// Check if super admin only
export const isSuperAdmin = () => {
  return getCurrentRole() === 'super admin';
};
