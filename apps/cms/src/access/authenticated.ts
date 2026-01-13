import type { Access, FieldAccess } from "payload";

/**
 * Access control for authenticated users only
 * Used to protect API routes in production while allowing admin panel access
 *
 * Returns true if:
 * - User is authenticated (via session or API key)
 *
 * This protects the REST API from unauthorized access while still
 * allowing authenticated users (admin panel or API key) to access data.
 */
export const isAuthenticated: Access = ({ req }) => {
  return Boolean(req.user);
};

/**
 * Access control that allows public read access
 * Use this for truly public data that doesn't need protection
 */
export const isPublic: Access = () => true;

/**
 * Field-level access for authenticated users
 */
export const isAuthenticatedField: FieldAccess = ({ req }) => {
  return Boolean(req.user);
};
