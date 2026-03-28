import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sendCustomerWelcomeEmail, sendPasswordResetEmail } from "../email";
import { getDb } from "../db";
import { customers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createCustomer,
  getCustomerByNo,
  getCustomerByEmail,
  getCustomerById,
  updateCustomerPassword,
  recordLoginFail,
  recordLoginSuccess,
  listCustomers,
  suspendCustomer,
  reactivateCustomer,
  regenerateActivationToken,
  activateByToken,
  generatePasswordResetToken,
  resetPasswordByToken,
  updateCustomerInfo,
  addCustomerLog,
  getCustomerLogs,
  validatePasswordStrength,
  generateInitialPassword,
} from "../customer.db";

// ─── Cookie name for customer session ─────────────────────────────────────
export const CUSTOMER_COOKIE = "cdp_customer_session";

// ─── JWT helpers ──────────────────────────────────────────────────────────
const secret = new TextEncoder().encode(ENV.cookieSecret || "fallback-dev-secret");

async function signCustomerToken(customerId: number, customerNo: string) {
  return new SignJWT({ sub: String(customerId), customerNo })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: Number(payload.sub), customerNo: payload.customerNo as string };
  } catch {
    return null;
  }
}


// ─── Admin guard ──────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Customer session helper ──────────────────────────────────────────────
export async function getCustomerFromRequest(req: any) {
  const token = req.cookies?.[CUSTOMER_COOKIE];
  if (!token) return null;
  const payload = await verifyCustomerToken(token);
  if (!payload) return null;
  const customer = await getCustomerById(payload.id);
  if (!customer) return null;
  if (customer.status === "suspended" || customer.status === "locked") return null;
  return customer;
}

// ─── Router ───────────────────────────────────────────────────────────────
export const customerRouter = router({

  // ── Activate account via token (set password) ─────────────────────────
  activate: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8).max(64),
    }))
    .mutation(async ({ input }) => {
      const err = validatePasswordStrength(input.newPassword);
      if (err) throw new TRPCError({ code: "BAD_REQUEST", message: err });

      const result = await activateByToken(input.token, input.newPassword);
      if (result === "not_found") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or already used activation link." });
      }
      if (result === "expired") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This activation link has expired. Please contact support to resend." });
      }

      await addCustomerLog({
        customerId: result.id,
        action: "account_activated",
        description: "Customer activated account and set password via email link",
      });

      return { success: true, email: result.email };
    }),

  // ── Login ─────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const customer = await getCustomerByEmail(input.email);

      if (!customer) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Check lock
      if (customer.status === "locked") {
        const lockedUntil = customer.lockedUntil;
        if (lockedUntil && lockedUntil > new Date()) {
          const mins = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Account is temporarily locked due to too many failed attempts. Please try again in ${mins} minute(s), or contact support.`,
          });
        }
      }

      if (customer.status === "suspended") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your account has been suspended. Please contact support@cooldrivepro.com" });
      }

      if (customer.status === "pending_activation") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your account has not been activated yet. Please check your email for the activation link." });
      }

      if (!customer.passwordHash) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account not yet activated. Please check your email." });
      }

      const valid = await bcrypt.compare(input.password, customer.passwordHash);
      if (!valid) {
        await recordLoginFail(customer.id);
        await addCustomerLog({
          customerId: customer.id,
          action: "login_failed",
          description: `Failed login attempt for ${input.email}`,
          ipAddress: ctx.req.ip,
        });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      await recordLoginSuccess(customer.id);
      await addCustomerLog({
        customerId: customer.id,
        action: "login_success",
        description: "Customer logged in successfully",
        ipAddress: ctx.req.ip,
      });

      const token = await signCustomerToken(customer.id, customer.customerNo);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(CUSTOMER_COOKIE, token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        mustChangePassword: customer.passwordChanged === 0,
        customerNo: customer.customerNo,
        contactName: customer.contactName,
      };
    }),

  // ── Logout ────────────────────────────────────────────────────────────
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(CUSTOMER_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  // ── Get current session ───────────────────────────────────────────────
  me: publicProcedure.query(async ({ ctx }) => {
    const customer = await getCustomerFromRequest(ctx.req);
    if (!customer) return null;
    return {
      id: customer.id,
      customerNo: customer.customerNo,
      contactName: customer.contactName,
      companyName: customer.companyName ?? null,
      email: customer.email,
      phone: customer.phone ?? null,
      customerType: customer.customerType,
      productModel: customer.productModel ?? null,
      orderNumber: customer.orderNumber ?? null,
      mustChangePassword: customer.passwordChanged === 0,
      status: customer.status,
    };
  }),

  // ── Change password (must be logged in) ───────────────────────────────
  changePassword: publicProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(64),
    }))
    .mutation(async ({ input, ctx }) => {
      const customer = await getCustomerFromRequest(ctx.req);
      if (!customer) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in first" });

      const err = validatePasswordStrength(input.newPassword);
      if (err) throw new TRPCError({ code: "BAD_REQUEST", message: err });

      if (!customer.passwordHash) throw new TRPCError({ code: "BAD_REQUEST", message: "Account not activated" });
      const valid = await bcrypt.compare(input.currentPassword, customer.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });

      await updateCustomerPassword(customer.id, input.newPassword);
      await addCustomerLog({
        customerId: customer.id,
        action: "password_changed",
        description: "Customer changed their password",
        ipAddress: ctx.req.ip,
      });
      return { success: true };
    }),

  // ── Forgot password: send reset link ──────────────────────────────────
  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      origin: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const result = await generatePasswordResetToken(input.email);
      // Always return success to prevent email enumeration
      if (result === "not_found" || result === "suspended") {
        return { success: true };
      }
      const { customer, token } = result;
      const resetUrl = `${input.origin}/support/reset-password?token=${token}`;
      await sendPasswordResetEmail({
        to: customer.email,
        contactName: customer.contactName,
        resetUrl,
      });
      await addCustomerLog({
        customerId: customer.id,
        action: "password_reset_requested",
        description: "Password reset link sent to customer email",
      });
      return { success: true };
    }),

  // ── Reset password via token ───────────────────────────────────────────
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8).max(64),
    }))
    .mutation(async ({ input }) => {
      const err = validatePasswordStrength(input.newPassword);
      if (err) throw new TRPCError({ code: "BAD_REQUEST", message: err });

      const result = await resetPasswordByToken(input.token, input.newPassword);
      if (result === "not_found") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or already used reset link." });
      }
      if (result === "expired") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link has expired. Please request a new one." });
      }
      await addCustomerLog({
        customerId: result.id,
        action: "password_reset",
        description: "Customer reset password via email link",
      });
      return { success: true };
    }),

  // ── Admin: create customer and send credentials email ─────────────────
  adminCreate: adminProcedure
    .input(z.object({
      contactName: z.string().min(1).max(128),
      email: z.string().email(),
      companyName: z.string().max(256).optional(),
      phone: z.string().max(64).optional(),
      customerType: z.enum(["regular", "dealer", "vip", "aftersales"]).default("aftersales"),
      salesRep: z.string().max(128).optional(),
      productModel: z.string().max(64).optional(),
      orderNumber: z.string().max(128).optional(),
      purchaseDate: z.string().max(32).optional(),
      adminNotes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getCustomerByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A customer account already exists for ${input.email} (${existing.customerNo})`,
        });
      }

      // Create customer: system generates initial password and hashes it
      const { customer, initialPassword } = await createCustomer({
        contactName: input.contactName,
        email: input.email,
        companyName: input.companyName,
        phone: input.phone,
        customerType: input.customerType,
        salesRep: input.salesRep,
        productModel: input.productModel,
        orderNumber: input.orderNumber,
        purchaseDate: input.purchaseDate,
        adminNotes: input.adminNotes,
        createdByAdminId: ctx.user.id,
        createdByAdminName: ctx.user.name ?? "Admin",
      });

      // Send welcome email with login email + initial password
      const emailResult = await sendCustomerWelcomeEmail({
        to: customer.email,
        contactName: customer.contactName,
        customerNo: customer.customerNo,
        initialPassword,
      });

      await addCustomerLog({
        customerId: customer.id,
        action: "account_created",
        description: `Account created by admin ${ctx.user.name ?? "Admin"}. Welcome email with credentials ${emailResult.success ? "sent successfully" : "FAILED: " + emailResult.error}.`,
        performedBy: ctx.user.name ?? "Admin",
        metadata: { emailSent: emailResult.success },
      });

      return {
        success: true,
        customerNo: customer.customerNo,
        emailSent: emailResult.success,
        // Always return initial password so admin can share manually with customer
        initialPassword,
      };
    }),

  // ── Admin: list customers ──────────────────────────────────────────────
  adminList: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(50).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => listCustomers(input)),

  // ── Admin: get customer detail ─────────────────────────────────────────
  adminGet: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });
      return customer;
    }),

  // ── Admin: update customer info ────────────────────────────────────────
  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      contactName: z.string().max(128).optional(),
      companyName: z.string().max(256).optional(),
      phone: z.string().max(64).optional(),
      email: z.string().email().optional(),
      customerType: z.enum(["regular", "dealer", "vip", "aftersales"]).optional(),
      salesRep: z.string().max(128).optional(),
      productModel: z.string().max(64).optional(),
      orderNumber: z.string().max(128).optional(),
      purchaseDate: z.string().max(32).optional(),
      adminNotes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      // Check email uniqueness if changing
      if (data.email) {
        const existing = await getCustomerByEmail(data.email);
        if (existing && existing.id !== id) {
          throw new TRPCError({ code: "CONFLICT", message: `Email ${data.email} is already used by another customer (${existing.customerNo})` });
        }
      }
      await updateCustomerInfo(id, data);
      await addCustomerLog({
        customerId: id,
        action: "info_updated",
        description: `Customer info updated by admin ${ctx.user.name ?? "Admin"}`,
        performedBy: ctx.user.name ?? "Admin",
      });
      return { success: true };
    }),

  // ── Admin: suspend customer ────────────────────────────────────────────
  adminSuspend: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await suspendCustomer(input.id);
      await addCustomerLog({
        customerId: input.id,
        action: "account_suspended",
        description: `Account suspended by admin ${ctx.user.name ?? "Admin"}`,
        performedBy: ctx.user.name ?? "Admin",
      });
      return { success: true };
    }),

  // ── Admin: reactivate customer ─────────────────────────────────────────
  adminReactivate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await reactivateCustomer(input.id);
      await addCustomerLog({
        customerId: input.id,
        action: "account_reactivated",
        description: `Account reactivated by admin ${ctx.user.name ?? "Admin"}`,
        performedBy: ctx.user.name ?? "Admin",
      });
      return { success: true };
    }),

  // ── Admin: resend credentials email ─────────────────────────────────────────
  adminResendActivation: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

      // Generate a new initial password and update the customer's password hash
      const newPassword = generateInitialPassword();
      await updateCustomerPassword(input.id, newPassword);
      // Reset mustChangePassword flag so customer must change on next login
      const db = await getDb();
      if (db) {
        await db.update(customers).set({ passwordChanged: 0 }).where(eq(customers.id, input.id));
      }

      // Send welcome email with new credentials
      const emailResult = await sendCustomerWelcomeEmail({
        to: customer.email,
        contactName: customer.contactName,
        customerNo: customer.customerNo,
        initialPassword: newPassword,
      });

      await addCustomerLog({
        customerId: input.id,
        action: "credentials_resent",
        description: `New credentials generated and email ${emailResult.success ? "sent" : "FAILED"} by admin ${ctx.user.name ?? "Admin"}.`,
        performedBy: ctx.user.name ?? "Admin",
        metadata: { emailSent: emailResult.success },
      });

      return {
        success: true,
        emailSent: emailResult.success,
        // Show password in UI only if email failed
        initialPassword: emailResult.success ? undefined : newPassword,
      };
    }),

  // ── Admin: view customer logs ──────────────────────────────────────────────
  adminGetLogs: adminProcedure
    .input(z.object({ id: z.number(), limit: z.number().max(100).default(50) }))
    .query(async ({ input }) => getCustomerLogs(input.id, input.limit)),
});
