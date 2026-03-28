import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  location: varchar("location", { length: 128 }),
  vehicleType: varchar("vehicleType", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Forum categories
 */
export const forumCategories = mysqlTable("forum_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  color: varchar("color", { length: 32 }),
  sortOrder: int("sortOrder").default(0),
  postCount: int("postCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ForumCategory = typeof forumCategories.$inferSelect;

/**
 * Forum posts / threads
 */
export const forumPosts = mysqlTable("forum_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  authorId: int("authorId").notNull(),
  categoryId: int("categoryId").notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  vehicleType: varchar("vehicleType", { length: 64 }),
  productModel: varchar("productModel", { length: 64 }),
  isPinned: boolean("isPinned").default(false),
  isClosed: boolean("isClosed").default(false),
  viewCount: int("viewCount").default(0),
  replyCount: int("replyCount").default(0),
  likeCount: int("likeCount").default(0),
  lastReplyAt: timestamp("lastReplyAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

/**
 * Forum replies / comments
 */
export const forumReplies = mysqlTable("forum_replies", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  parentReplyId: int("parentReplyId"),
  likeCount: int("likeCount").default(0),
  isAccepted: boolean("isAccepted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

/**
 * Post likes (users who liked a post)
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Reply likes
 */
export const replyLikes = mysqlTable("reply_likes", {
  id: int("id").autoincrement().primaryKey(),
  replyId: int("replyId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── After-Sales Ticket System ─────────────────────────────────────────────

/**
 * Support tickets submitted by customers
 * Status flow: pending → reviewing → resolved / rejected
 */
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  /** Public-facing ticket number, e.g. CDP-20260316-0001 */
  ticketNo: varchar("ticketNo", { length: 32 }).notNull().unique(),
  /** Customer info (may not be logged in) */
  customerName: varchar("customerName", { length: 128 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  /** Auto-generated customer number, e.g. CDP-C-2026-0001 — unique per email, reused on repeat submissions */
  customerNo: varchar("customerNo", { length: 32 }),
  /** Linked user account if logged in */
  userId: int("userId"),
  /** Product info */
  productModel: varchar("productModel", { length: 64 }).notNull(),
  purchaseDate: varchar("purchaseDate", { length: 32 }),
  orderNumber: varchar("orderNumber", { length: 128 }),
  /** Problem details */
  errorCode: varchar("errorCode", { length: 64 }),
  problemDescription: text("problemDescription").notNull(),
  /** Ticket lifecycle */
  status: mysqlEnum("status", ["pending", "reviewing", "resolved", "rejected"]).default("pending").notNull(),
  /** Admin response */
  adminDiagnosis: text("adminDiagnosis"),
  adminSolution: text("adminSolution"),
  replacementDecision: mysqlEnum("replacementDecision", ["none", "partial", "full"]),
  adminId: int("adminId"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Files attached to a support ticket (videos, photos)
 */
export const ticketAttachments = mysqlTable("ticket_attachments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 256 }),
  fileType: varchar("fileType", { length: 64 }),
  fileSize: int("fileSize"),
  /** video | photo | other */
  attachmentType: mysqlEnum("attachmentType", ["video", "photo", "other"]).default("other"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketAttachment = typeof ticketAttachments.$inferSelect;

/**
 * Conversation messages on a ticket (customer ↔ admin)
 */
export const ticketMessages = mysqlTable("ticket_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  /** admin | customer */
  senderRole: mysqlEnum("senderRole", ["admin", "customer"]).notNull(),
  senderName: varchar("senderName", { length: 128 }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;

// ─── Customer Account System ───────────────────────────────────────────────

/**
 * Verified offline customer accounts — created ONLY by admin after qualification review.
 * No self-registration allowed.
 *
 * Account opening flow:
 *   1. Admin creates account with customer email
 *   2. System generates customerNo (CDP-C-YYYY-NNNN) + activation token
 *   3. System emails activation link to customer
 *   4. Customer clicks link, sets their own password
 *   5. Customer logs in with email + password
 *   6. On first login, system forces password change if not yet changed
 *
 * Customer types: regular | dealer | vip | aftersales
 * Account status: pending_activation | active | suspended | locked
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),

  // ── Identity ──────────────────────────────────────────────────────────────
  /** Auto-generated public customer number, e.g. CDP-C-2026-0001 */
  customerNo: varchar("customerNo", { length: 32 }).notNull().unique(),
  /** Company or customer name */
  companyName: varchar("companyName", { length: 256 }),
  /** Primary contact person full name */
  contactName: varchar("contactName", { length: 128 }).notNull(),
  /** Login email — unique identifier, validated for format */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Contact phone number */
  phone: varchar("phone", { length: 64 }),
  /** Customer type determines visible features and menus */
  customerType: mysqlEnum("customerType", ["regular", "dealer", "vip", "aftersales"])
    .default("aftersales")
    .notNull(),
  /** Assigned sales rep / business manager name */
  salesRep: varchar("salesRep", { length: 128 }),

  // ── Qualification ─────────────────────────────────────────────────────────
  /** Qualification review status — only approved customers can get accounts */
  qualificationStatus: mysqlEnum("qualificationStatus", ["pending", "approved", "rejected"])
    .default("approved")
    .notNull(),
  qualificationNotes: text("qualificationNotes"),

  // ── Account / Auth ────────────────────────────────────────────────────────
  /** bcrypt hash of current password */
  passwordHash: varchar("passwordHash", { length: 256 }),
  /** Whether customer has changed their initial password (forced on first login) */
  passwordChanged: int("passwordChanged").default(0).notNull(),
  /** Token for email activation link (set password) or password reset */
  activationToken: varchar("activationToken", { length: 128 }),
  /** Expiry for activationToken */
  activationTokenExpiresAt: timestamp("activationTokenExpiresAt"),
  /** Account lifecycle status */
  status: mysqlEnum("status", ["pending_activation", "active", "suspended", "locked"])
    .default("pending_activation")
    .notNull(),
  /** Failed login attempt counter — reset on successful login */
  loginFailCount: int("loginFailCount").default(0).notNull(),
  /** When account was locked due to too many failed attempts */
  lockedUntil: timestamp("lockedUntil"),

  // ── Product / Order ───────────────────────────────────────────────────────
  productModel: varchar("productModel", { length: 64 }),
  orderNumber: varchar("orderNumber", { length: 128 }),
  purchaseDate: varchar("purchaseDate", { length: 32 }),

  // ── Admin metadata ────────────────────────────────────────────────────────
  adminNotes: text("adminNotes"),
  createdByAdminId: int("createdByAdminId"),
  createdByAdminName: varchar("createdByAdminName", { length: 128 }),

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  firstLoginAt: timestamp("firstLoginAt"),
  lastLoginAt: timestamp("lastLoginAt"),
  passwordChangedAt: timestamp("passwordChangedAt"),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Audit log for all customer account operations.
 * Records: account_created, account_activated, login_success, login_failed,
 *          password_changed, password_reset, account_suspended, account_activated,
 *          email_changed, permission_changed, notification_sent, notification_failed
 */
export const customerLogs = mysqlTable("customer_logs", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  /** Action type for filtering */
  action: varchar("action", { length: 64 }).notNull(),
  /** Human-readable description */
  description: text("description").notNull(),
  /** Who performed the action: admin name or 'system' or 'customer' */
  performedBy: varchar("performedBy", { length: 128 }),
  /** IP address of the request */
  ipAddress: varchar("ipAddress", { length: 64 }),
  /** Extra context as JSON string */
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerLog = typeof customerLogs.$inferSelect;
