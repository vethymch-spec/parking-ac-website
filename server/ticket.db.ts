import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  supportTickets,
  ticketAttachments,
  ticketMessages,
  type InsertSupportTicket,
} from "../drizzle/schema";

// ─── Customer number generator ─────────────────────────────────────────────
// Format: CDP-C-YYYY-NNNN (e.g. CDP-C-2026-0001)
// One customer number per email — reused on repeat submissions

export async function getOrCreateCustomerNo(email: string): Promise<string> {
  const db = await getDb();
  if (!db) {
    const year = new Date().getFullYear();
    return `CDP-C-${year}-0001`;
  }
  // Check if this email already has a customer number
  const existing = await db
    .select({ customerNo: supportTickets.customerNo })
    .from(supportTickets)
    .where(and(eq(supportTickets.customerEmail, email), sql`customerNo IS NOT NULL`))
    .limit(1);
  if (existing[0]?.customerNo) {
    return existing[0].customerNo;
  }
  // Generate a new sequential number for this year
  const year = new Date().getFullYear();
  const prefix = `CDP-C-${year}-`;
  const countResult = await db
    .select({ count: sql<number>`count(distinct customerEmail)` })
    .from(supportTickets)
    .where(sql`customerNo LIKE ${prefix + '%'}`);
  const seq = String((Number(countResult[0]?.count ?? 0) + 1)).padStart(4, "0");
  return `${prefix}${seq}`;
}

// ─── Ticket number generator ────────────────────────────────────────────────

export async function generateTicketNo(): Promise<string> {
  const db = await getDb();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  if (!db) return `CDP-${dateStr}-0001`;
  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportTickets);
  const seq = String((Number(count[0]?.count ?? 0) + 1)).padStart(4, "0");
  return `CDP-${dateStr}-${seq}`;
}

// ─── Create ticket ───────────────────────────────────────────────────────────

export async function createTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(supportTickets).values(data);
  return result;
}

// ─── Attachments ─────────────────────────────────────────────────────────────

export async function addAttachment(data: {
  ticketId: number;
  fileKey: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  attachmentType: "video" | "photo" | "other";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ticketAttachments).values(data);
}

export async function getAttachmentsByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketAttachments).where(eq(ticketAttachments.ticketId, ticketId));
}

// ─── Get tickets ─────────────────────────────────────────────────────────────

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getTicketByNo(ticketNo: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(supportTickets).where(eq(supportTickets.ticketNo, ticketNo)).limit(1);
  return rows[0] ?? null;
}

export async function getTicketByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.customerEmail, email))
    .orderBy(desc(supportTickets.createdAt))
    .limit(20);
}

export async function getAllTickets(opts: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { tickets: [], total: 0 };

  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(supportTickets.status, opts.status as "pending" | "reviewing" | "resolved" | "rejected"));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const tickets = await db
    .select()
    .from(supportTickets)
    .where(whereClause)
    .orderBy(desc(supportTickets.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportTickets)
    .where(whereClause);

  return { tickets, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Update ticket ────────────────────────────────────────────────────────────

export async function updateTicketStatus(
  id: number,
  data: {
    status: "pending" | "reviewing" | "resolved" | "rejected";
    adminDiagnosis?: string;
    adminSolution?: string;
    replacementDecision?: "none" | "partial" | "full";
    adminId?: number;
    resolvedAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function addMessage(data: {
  ticketId: number;
  senderRole: "admin" | "customer";
  senderName?: string;
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ticketMessages).values(data);
}

export async function getMessagesByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(ticketMessages.createdAt);
}
