import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

/* ─── RBAC feature key → sidebar route ID mapping ──────────────────────── */
const FEATURE_ROUTE_MAP = {
  cockpit:        'dashboard',
  crm:            'crm',
  students:       'students',
  lms:            'lms',
  pos:            'pos',
  finance:        'finance',
  invoices:       'invoices',
  expenses:       'expenses',
  reconciliation: 'reconciliation',
  budget:         'budget',
  ledger:         'ledger',
  journal:        'journal',
  cashflow:       'cashflow',
  reports:        'reports',
  pte:            'pte',
  erp:            'erp',
  assets:         'assets',
  payroll:        'payroll',
  attendance:     'attendance',
  branches:       'branches',
  automation:     'automation',
  website:        'website-management',
  rbac:           'rbac',
};

/* Extra routes that are sub-sections of a feature */
const FEATURE_EXTRA_ROUTES = {
  finance: ['liquid-accounts'],
  reports: ['finance-reports'],
  lms:     ['materials'],
  payroll: ['hrm-dashboard', 'staff-attendance', 'leave-management', 'recruitment', 'staff-documents', 'performance', 'shifts', 'org-chart'],
};

/* Reverse map: route → feature key */
const ROUTE_FEATURE_MAP = {};
Object.entries(FEATURE_ROUTE_MAP).forEach(([feat, route]) => {
  ROUTE_FEATURE_MAP[route] = feat;
});
Object.entries(FEATURE_EXTRA_ROUTES).forEach(([feat, routes]) => {
  routes.forEach(r => { ROUTE_FEATURE_MAP[r] = feat; });
});

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null); // null = not loaded yet
  const [customRoles, setCustomRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Load permissions from backend */
  const loadPermissions = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await api.get('/rbac/config');
      if (res.data.permissions) {
        setPermissions(res.data.permissions);
        setCustomRoles(res.data.customRoles || []);
      } else {
        setPermissions(null); // no config saved yet → will use defaults
      }
    } catch (err) {
      console.warn('Failed to load RBAC config:', err);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  /* Save permissions to backend (called from RBAC admin page) */
  const savePermissions = useCallback(async (newPermissions, newCustomRoles) => {
    try {
      await api.put('/rbac/config', {
        permissions: newPermissions,
        customRoles: newCustomRoles || [],
      });
      setPermissions(newPermissions);
      setCustomRoles(newCustomRoles || []);
      return true;
    } catch (err) {
      console.error('Failed to save RBAC config:', err);
      throw err;
    }
  }, []);

  /**
   * Check if the current user's role has a specific admin feature enabled.
   * Returns true if:
   *  - permissions haven't been loaded yet (graceful loading)
   *  - the user is super_admin or branch_admin (always full access)
   *  - the RBAC matrix says the feature is enabled for the user's role in admin portal
   */
  const canAccess = useCallback((routeId) => {
    if (!user) return false;
    const role = user.role;

    // Super/branch admins always have full access
    if (['super_admin', 'branch_admin'].includes(role)) return true;

    // Dashboard is always accessible for any authenticated user
    if (routeId === 'dashboard') return true;

    // If RBAC config hasn't been saved yet, fall back to open access
    if (!permissions) return true;

    // Map the route to a feature key
    const featureKey = ROUTE_FEATURE_MAP[routeId];
    if (!featureKey) return true; // Unknown route → allow (safer for custom pages)

    // Check the admin portal permission for this role
    const adminConfig = permissions[role]?.admin;
    
    // If the role has no config entry at all in the matrix, allow access
    // (the admin hasn't configured this role yet — graceful default)
    if (!permissions[role]) return true;
    
    if (!adminConfig) return false; // Role exists in matrix but admin portal disabled
    if (!adminConfig.enabled) return false; // Admin portal explicitly disabled

    return !!adminConfig.features?.[featureKey];
  }, [user, permissions]);

  /**
   * Filter a list of sidebar items, keeping only those the user's role can access.
   */
  const filterItems = useCallback((items) => {
    if (!user) return [];
    const role = user.role;
    if (['super_admin', 'branch_admin'].includes(role)) return items;
    if (!permissions) return items; // No config → show all (graceful default)

    return items.filter(item => canAccess(item.id));
  }, [user, permissions, canAccess]);

  /**
   * Get the full permission matrix for the RBAC admin page.
   */
  const getFullConfig = useCallback(() => ({
    permissions,
    customRoles,
  }), [permissions, customRoles]);

  return (
    <PermissionContext.Provider value={{
      permissions,
      customRoles,
      loading,
      canAccess,
      filterItems,
      savePermissions,
      loadPermissions,
      getFullConfig,
      FEATURE_ROUTE_MAP,
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
