import { eq, desc, sql, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { customers, customerLogs } from "../drizzle/schema";

// ─── Customer number generator ─────────────────────────────────────────────
// Format: CDP-C-YYYY-NNNN (e.g. CDP-C-2026-0001)
export async function generateCustomerNo(): Promise<string> {
  const db = await getDb();
  const year = new Date().getFullYear();
  const prefix = `CDP-C-${year}-`;
  if (!db) return `${prefix}0001`;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(like(customers.customerNo, `${prefix}%`));
  const seq = String((Number(result[0]?.count ?? 0) + 1)).padStart(4, "0");
  return `${prefix}${seq}`;
}

// ─── Activation token generator ───────────────────────────────────────────
export function generateActivationToken(): { token: string; expiresAt: Date } {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  return { token, expiresAt };
}

// ─── Initial password generator ───────────────────────────────────────────
// Generates a readable 10-char password: 4 uppercase + 4 digits + 2 special
// Example: CDP@2026#AB12
export function generateInitialPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const specials = "@#!";
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  // Pattern: CDP@YEAR#XX99 style - memorable and strong
  const year = new Date().getFullYear();
  const part1 = rand(upper) + rand(upper) + rand(lower) + rand(lower);
  const part2 = rand(digits) + rand(digits) + rand(digits) + rand(digits);
  const sep = rand(specials);
  return `CDP${sep}${year}${sep}${part1}${part2}`;
}

// ─── Password strength validation ─────────────────────────────────────────
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

// ─── Create customer (admin only) ─────────────────────────────────────────
export async function createCustomer(data: {
  contactName: string;
  email: string;
  companyName?: string;
  phone?: string;
  customerType?: "regular" | "dealer" | "vip" | "aftersales";
  salesRep?: string;
  productModel?: string;
  orderNumber?: string;
  purchaseDate?: string;
  adminNotes?: string;
  createdByAdminId?: number;
  createdByAdminName?: string;
}): Promise<{ customer: typeof customers.$inferSelect; initialPassword: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const customerNo = await generateCustomerNo();
  // Generate a readable initial password and hash it for storage
  const initialPassword = generateInitialPassword();
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await db.insert(customers).values({
    customerNo,
    contactName: data.contactName,
    email: data.email.toLowerCase(),
    companyName: data.companyName ?? null,
    phone: data.phone ?? null,
    customerType: (data.customerType ?? "aftersales") as any,
    salesRep: data.salesRep ?? null,
    productModel: data.productModel ?? null,
    orderNumber: data.orderNumber ?? null,
    purchaseDate: data.purchaseDate ?? null,
    adminNotes: data.adminNotes ?? null,
    createdByAdminId: data.createdByAdminId ?? null,
    createdByAdminName: data.createdByAdminName ?? null,
    activationToken: null,
    activationTokenExpiresAt: null,
    passwordHash,
    // passwordChanged: 1 means no forced password change on first login
    passwordChanged: 1,
    status: "active",
    loginFailCount: 0,
    qualificationStatus: "approved",
  });

  const created = await db.select().from(customers)
    .where(eq(customers.customerNo, customerNo)).limit(1);
  if (!created[0]) throw new Error("Failed to create customer");
  return { customer: created[0], initialPassword };
}

// ─── Activate account via token (set password) ────────────────────────────
export async function activateByToken(
  token: string,
  newPassword: string
): Promise<typeof customers.$inferSelect | "not_found" | "expired"> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(customers)
    .where(eq(customers.activationToken, token)).limit(1);
  if (!rows[0]) return "not_found";
  const customer = rows[0];

  if (customer.activationTokenExpiresAt && customer.activationTokenExpiresAt < new Date()) {
    return "expired";
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(customers).set({
    passwordHash: hash,
    passwordChanged: 1,
    passwordChangedAt: new Date(),
    activationToken: null,
    activationTokenExpiresAt: null,
    status: "active",
    loginFailCount: 0,
    lockedUntil: null,
  }).where(eq(customers.id, customer.id));

  return customer;
}

// ─── Forgot password: generate reset token ────────────────────────────────
export async function generatePasswordResetToken(
  email: string
): Promise<{ customer: typeof customers.$inferSelect; token: string } | "not_found" | "suspended"> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const customer = await getCustomerByEmail(email);
  if (!customer) return "not_found";
  if (customer.status === "suspended") return "suspended";

  const { token, expiresAt } = generateActivationToken();
  await db.update(customers).set({
    activationToken: token,
    activationTokenExpiresAt: expiresAt,
  }).where(eq(customers.id, customer.id));

  return { customer, token };
}

// ─── Reset password via token ─────────────────────────────────────────────
export async function resetPasswordByToken(
  token: string,
  newPassword: string
): Promise<typeof customers.$inferSelect | "not_found" | "expired"> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(customers)
    .where(eq(customers.activationToken, token)).limit(1);
  if (!rows[0]) return "not_found";
  const customer = rows[0];

  if (customer.activationTokenExpiresAt && customer.activationTokenExpiresAt < new Date()) {
    return "expired";
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(customers).set({
    passwordHash: hash,
    passwordChanged: 1,
    passwordChangedAt: new Date(),
    activationToken: null,
    activationTokenExpiresAt: null,
    loginFailCount: 0,
    lockedUntil: null,
    status: "active",
  }).where(eq(customers.id, customer.id));

  return customer;
}

// ─── Login helpers ─────────────────────────────────────────────────────────
const MAX_FAIL = 5;
const LOCK_MINUTES = 30;

export async function recordLoginFail(customerId: number) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select({ loginFailCount: customers.loginFailCount })
    .from(customers).where(eq(customers.id, customerId)).limit(1);
  const fails = (rows[0]?.loginFailCount ?? 0) + 1;
  if (fails >= MAX_FAIL) {
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    await db.update(customers).set({ loginFailCount: fails, lockedUntil, status: "locked" })
      .where(eq(customers.id, customerId));
  } else {
    await db.update(customers).set({ loginFailCount: fails })
      .where(eq(customers.id, customerId));
  }
}

export async function recordLoginSuccess(customerId: number) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select({ firstLoginAt: customers.firstLoginAt })
    .from(customers).where(eq(customers.id, customerId)).limit(1);
  const now = new Date();
  await db.update(customers).set({
    loginFailCount: 0,
    lockedUntil: null,
    lastLoginAt: now,
    firstLoginAt: rows[0]?.firstLoginAt ?? now,
    status: "active",
  }).where(eq(customers.id, customerId));
}

// ─── Change password ───────────────────────────────────────────────────────
export async function updateCustomerPassword(id: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(customers).set({
    passwordHash: hash,
    passwordChanged: 1,
    passwordChangedAt: new Date(),
  }).where(eq(customers.id, id));
}

// ─── Admin: resend activation link ────────────────────────────────────────
export async function regenerateActivationToken(
  customerId: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { token, expiresAt } = generateActivationToken();
  await db.update(customers).set({
    activationToken: token,
    activationTokenExpiresAt: expiresAt,
    status: "pending_activation",
  }).where(eq(customers.id, customerId));
  return token;
}

// ─── Admin: suspend / reactivate ──────────────────────────────────────────
export async function suspendCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ status: "suspended" }).where(eq(customers.id, id));
}

export async function reactivateCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ status: "active", loginFailCount: 0, lockedUntil: null })
    .where(eq(customers.id, id));
}

// ─── Admin: update customer info ──────────────────────────────────────────
export async function updateCustomerInfo(
  id: number,
  data: Partial<{
    contactName: string;
    companyName: string;
    phone: string;
    email: string;
    customerType: string;
    salesRep: string;
    productModel: string;
    orderNumber: string;
    purchaseDate: string;
    adminNotes: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const update: Record<string, any> = { ...data };
  if (data.email) update.email = data.email.toLowerCase();
  if (Object.keys(update).length > 0) {
    await db.update(customers).set(update).where(eq(customers.id, id));
  }
}

// ─── Lookups ───────────────────────────────────────────────────────────────
export async function getCustomerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(customers)
    .where(eq(customers.email, email.toLowerCase())).limit(1);
  return rows[0] ?? undefined;
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return rows[0] ?? undefined;
}

export async function getCustomerByNo(customerNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(customers)
    .where(eq(customers.customerNo, customerNo.toUpperCase())).limit(1);
  return rows[0] ?? undefined;
}

// ─── List customers (admin) ────────────────────────────────────────────────
export async function listCustomers(opts: { page: number; pageSize: number; search?: string }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const offset = (opts.page - 1) * opts.pageSize;
  const pat = opts.search ? `%${opts.search}%` : null;
  const condition = pat
    ? or(
        like(customers.customerNo, pat),
        like(customers.contactName, pat),
        like(customers.email, pat),
        like(customers.companyName, pat),
        like(customers.orderNumber, pat)
      )
    : undefined;

  const [items, countResult] = await Promise.all([
    condition
      ? db.select().from(customers).where(condition).orderBy(desc(customers.createdAt)).limit(opts.pageSize).offset(offset)
      : db.select().from(customers).orderBy(desc(customers.createdAt)).limit(opts.pageSize).offset(offset),
    condition
      ? db.select({ count: sql<number>`count(*)` }).from(customers).where(condition)
      : db.select({ count: sql<number>`count(*)` }).from(customers),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Audit log ─────────────────────────────────────────────────────────────
export async function addCustomerLog(opts: {
  customerId: number;
  action: string;
  description: string;
  performedBy?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(customerLogs).values({
      customerId: opts.customerId,
      action: opts.action,
      description: opts.description,
      performedBy: opts.performedBy ?? "system",
      ipAddress: opts.ipAddress ?? null,
      metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
    });
  } catch (err) {
    console.warn("[CustomerLog] Failed to write log:", err);
  }
}

export async function getCustomerLogs(customerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerLogs)
    .where(eq(customerLogs.customerId, customerId))
    .orderBy(desc(customerLogs.createdAt))
    .limit(limit);
}
