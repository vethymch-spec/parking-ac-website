import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    avatar: null,
    bio: null,
    location: null,
    vehicleType: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext({ id: 99, openId: "admin-openid", role: "admin", name: "Admin User" });
}

describe("ticket router", () => {
  // ── Public procedures ──────────────────────────────────────────────────────

  it("submit requires valid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ticket.submit({
        customerName: "John",
        customerEmail: "not-an-email",
        productModel: "VS02 PRO",
        problemDescription: "The unit stops cooling after 30 minutes of operation.",
      })
    ).rejects.toThrow();
  });

  it("submit requires problem description of at least 10 chars", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ticket.submit({
        customerName: "John",
        customerEmail: "john@example.com",
        productModel: "VS02 PRO",
        problemDescription: "short",
      })
    ).rejects.toThrow();
  });

  it("getMyTickets requires valid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ticket.getMyTickets({ email: "bad-email" })).rejects.toThrow();
  });

  it("getMyTickets returns array for valid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ticket.getMyTickets({ email: "nonexistent@example.com" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getTicketDetail throws NOT_FOUND for non-existent ticket", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ticket.getTicketDetail({ ticketNo: "CDP-00000000-9999", email: "test@example.com" })
    ).rejects.toThrow("Ticket not found");
  });

  // ── Admin-only procedures ──────────────────────────────────────────────────

  it("adminListTickets requires admin role", async () => {
    const ctx = createUserContext(); // regular user
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ticket.adminListTickets({ page: 1, limit: 10 })).rejects.toThrow();
  });

  it("adminListTickets returns tickets and total for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ticket.adminListTickets({ page: 1, limit: 10 });
    expect(result).toHaveProperty("tickets");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.tickets)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("adminGetTicket requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ticket.adminGetTicket({ id: 1 })).rejects.toThrow();
  });

  it("adminGetTicket throws NOT_FOUND for non-existent ticket", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ticket.adminGetTicket({ id: 999999 })).rejects.toThrow();
  });

  it("adminMarkReviewing requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ticket.adminMarkReviewing({ id: 1 })).rejects.toThrow();
  });

  it("adminResolve requires admin role", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ticket.adminResolve({
        id: 1,
        status: "resolved",
        adminDiagnosis: "Test diagnosis",
        adminSolution: "Test solution",
        replacementDecision: "none",
        messageToCustomer: "Test message",
      })
    ).rejects.toThrow();
  });

  it("uploadAttachment requires valid attachmentType", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ticket.uploadAttachment({
        ticketId: 1,
        ticketNo: "CDP-20260316-0001",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        fileDataBase64: "dGVzdA==",
        attachmentType: "invalid" as any,
      })
    ).rejects.toThrow();
  });
});
