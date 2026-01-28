# CMS Roles and Access Control

This document describes the role-based access control (RBAC) system for the Payload CMS admin panel.

## Table of Contents

- [Overview](#overview)
- [Available Roles](#available-roles)
- [Permission Matrix](#permission-matrix)
- [Creating Editor Accounts](#creating-editor-accounts)
- [Technical Implementation](#technical-implementation)
- [Related Documentation](#related-documentation)

---

## Overview

The CMS uses a three-role system to control access to content and administrative functions:

```
┌─────────────────────────────────────────────────────────────┐
│  Admin                                                       │
│  └─ Full access to everything                               │
│     ├─ All CRUD operations on content                       │
│     ├─ User management                                      │
│     └─ All field editing (including status)                 │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│  Editor                                                      │
│  └─ Content creation and editing                            │
│     ├─ Create/Update articles, profiles, media              │
│     ├─ Update globals (homepage, pages, settings)           │
│     └─ Cannot delete content or manage users                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│  API                                                         │
│  └─ Server-to-CMS integrations                              │
│     ├─ Full programmatic access via API keys                │
│     └─ Used by backend services                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Available Roles

### Admin

**Purpose:** Full administrative control over the CMS.

**Capabilities:**

- Create, read, update, and delete all content
- Manage user accounts (create editors, reset passwords)
- Change article status (in-stock, group buy, etc.)
- Access all collections and globals
- Delete media files

**Use case:** Site owners and administrators who need complete control.

### Editor

**Purpose:** Content creation and editing without destructive capabilities.

**Capabilities:**

- Create and update articles and keycap profiles
- Upload and update media (cannot delete)
- Update all page globals (homepage, info page, suggestion page, etc.)
- Update settings globals (social networks)

**Restrictions:**

- Cannot delete any content
- Cannot access or manage user accounts
- Cannot change article status field (read-only)

**Use case:** Content contributors who need to add and edit content but shouldn't have destructive access.

### API

**Purpose:** Programmatic access for backend services.

**Capabilities:**

- Full CRUD operations via API key authentication
- Same access level as Admin for programmatic operations

**Use case:** Server integrations that need to read or sync CMS data.

---

## Permission Matrix

### Collections

| Collection         | Create             | Read          | Update             | Delete     |
| ------------------ | ------------------ | ------------- | ------------------ | ---------- |
| **Articles**       | Admin, Editor, API | Authenticated | Admin, Editor, API | Admin, API |
| **KeycapProfiles** | Admin, Editor, API | Authenticated | Admin, Editor, API | Admin, API |
| **Media**          | Admin, Editor, API | Public        | Admin, Editor, API | Admin, API |
| **Users**          | Admin              | Admin         | Admin              | Admin      |

### Globals

| Global               | Read          | Update             |
| -------------------- | ------------- | ------------------ |
| **Homepage**         | Authenticated | Admin, Editor, API |
| **InformationsPage** | Authenticated | Admin, Editor, API |
| **SuggestionPage**   | Authenticated | Admin, Editor, API |
| **SocialNetworks**   | Authenticated | Admin, Editor, API |
| **NotFoundPage**     | Authenticated | Admin, Editor, API |

### Field-Level Restrictions

| Collection   | Field    | Create | Read | Update     |
| ------------ | -------- | ------ | ---- | ---------- |
| **Articles** | `status` | All    | All  | Admin only |

---

## Creating Editor Accounts

### Via Admin Panel

1. Log in as an Admin user
2. Navigate to **Users** in the sidebar
3. Click **Create New**
4. Fill in the required fields:
   - **Email:** Editor's email address
   - **Password:** Initial password (editor should change on first login)
   - **Role:** Select **Editor**
5. Click **Save**

### Editor First Login

1. Editor navigates to `/admin`
2. Logs in with provided credentials
3. (Optional) Changes password via account settings

### What Editors See

When logged in, editors will:

- See all content collections (Articles, Keycap Profiles, Media)
- See all globals (Homepage, Info Page, etc.)
- **Not** see the Users collection in the sidebar
- See the status field on articles as **read-only** (cannot change)
- See delete buttons **disabled** or actions **denied**

---

## Technical Implementation

### Access Functions

Access control is implemented via functions in `apps/cms/src/access/roles.ts`:

```typescript
// Admin only - for Users collection and delete operations
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

// Admin or API - for delete operations (editors cannot delete)
export const isAdminOrApi: Access = ({ req: { user } }) => {
  return user?.role === "admin" || user?.role === "api";
};

// Admin, Editor, or API - for create/update operations
export const isAdminOrEditorOrApi: Access = ({ req: { user } }) => {
  return (
    user?.role === "admin" || user?.role === "editor" || user?.role === "api"
  );
};

// Field-level: Admin only (for status field)
export const isAdminField: FieldAccess = ({ req: { user } }) => {
  return user?.role === "admin";
};
```

### JWT Optimization

The role field uses `saveToJWT: true` to avoid database lookups on every request:

```typescript
{
  name: "role",
  type: "select",
  saveToJWT: true, // Role available in JWT token
  // ...
}
```

### Applying Access Control

**Collections:**

```typescript
export const Articles: CollectionConfig = {
  // ...
  access: {
    create: isAdminOrEditorOrApi,
    read: isAuthenticated,
    update: isAdminOrEditorOrApi,
    delete: isAdminOrApi,
  },
};
```

**Field-level (Articles status):**

```typescript
{
  name: "status",
  type: "select",
  access: {
    update: isAdminField, // Only admins can change
  },
  // ...
}
```

**Globals:**

```typescript
export const Homepage: GlobalConfig = {
  // ...
  access: {
    read: isAuthenticated,
    update: isAdminOrEditorOrApi,
  },
};
```

---

## Related Documentation

- [ADDING_CMS_COLLECTIONS.md](./ADDING_CMS_COLLECTIONS.md) - How to add new collections with access control
- [apps/cms/CLAUDE.md](../../apps/cms/CLAUDE.md) - CMS configuration reference
- [Payload Access Control Docs](https://payloadcms.com/docs/access-control/overview) - Official documentation
