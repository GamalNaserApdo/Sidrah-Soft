/**
 * CMS Capability Helpers
 *
 * Wraps AuthContext capability checks with convenience functions.
 * Uses actual backend capability strings (module.action format).
 */

import { useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function useCapabilities() {
  const { user, hasCapability, hasModuleAccess } = useAuth();

  const can = useCallback(
    (module, action) => hasCapability(`${module}.${action}`),
    [hasCapability],
  );

  const canView = useCallback(
    (module) => hasCapability(`${module}.view`),
    [hasCapability],
  );

  const canCreate = useCallback(
    (module) => hasCapability(`${module}.create`),
    [hasCapability],
  );

  const canUpdate = useCallback(
    (module) => hasCapability(`${module}.update`),
    [hasCapability],
  );

  const canDelete = useCallback(
    (module) => hasCapability(`${module}.delete`),
    [hasCapability],
  );

  const canPublish = useCallback(
    (module) => hasCapability(`${module}.publish`),
    [hasCapability],
  );

  const canExport = useCallback(
    (module) => hasCapability(`${module}.export`),
    [hasCapability],
  );

  const canAssign = useCallback(
    (module) => hasCapability(`${module}.assign`),
    [hasCapability],
  );

  return {
    user,
    can,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canPublish,
    canExport,
    canAssign,
    hasModuleAccess,
    hasCapability,
  };
}

