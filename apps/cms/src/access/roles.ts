import type { Access, FieldAccess } from "payload";

/**
 * Access control: Admin role only
 * Used for Users collection management and sensitive operations
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Access control: Admin or API role
 * Used for delete operations (editors cannot delete content)
 */
export const isAdminOrApi: Access = ({ req: { user } }) => {
  return user?.role === "admin" || user?.role === "api";
};

/**
 * Access control: Admin, Editor, or API role
 * Used for create/update operations on content
 */
export const isAdminOrEditorOrApi: Access = ({ req: { user } }) => {
  return (
    user?.role === "admin" || user?.role === "editor" || user?.role === "api"
  );
};

/**
 * Field-level access: Admin only
 * Used to make specific fields read-only for non-admin users (e.g., status field)
 */
export const isAdminField: FieldAccess = ({ req: { user } }) => {
  return user?.role === "admin";
};
