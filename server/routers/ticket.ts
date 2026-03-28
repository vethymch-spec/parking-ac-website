import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";
import {
  addAttachment,
  addMessage,
  createTicket,
  generateTicketNo,
  getOrCreateCustomerNo,
  getAllTickets,
  getAttachmentsByTicketId,
  getMessagesByTicketId,
  getTicketByEmail,
  getTicketById,
  getTicketByNo,
  updateTicketStatus,
} from "../ticket.db";
import { ENV } from "../_core/env";

// ─── Email helper (via EmailJS REST API) ─────────────────────────────────────
async function sendCustomerEmail(opts: {
  toEmail: string;
  toName: string;
  ticketNo: string;
  subject: string;
  message: string;
}) {
  // Use EmailJS REST API (same service already configured for contact form)
  try {
    const serviceId = "service_d3fg7kb";
    const templateId = "template_nbw2knk";
    const publicKey = process.env.EMAILJS_PUBLIC_KEY ?? "YOUR_PUBLIC_KEY";

    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_name: opts.toName,
          to_email: opts.toEmail,
          from_name: "CoolDrivePro Support",
          subject: opts.subject,
          message: opts.message,
          ticket_no: opts.ticketNo,
          reply_to: "support@cooldrivepro.com",
        },
      }),
    });
  } catch (err) {
    console.warn("[Ticket] Email send failed:", err);
  }
}

// ─── Admin guard ─────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const ticketRouter = router({
  // ── Submit new ticket (public, no login required) ──────────────────────────
  submit: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(1).max(128),
        customerEmail: z.string().email(),
        productModel: z.string().min(1).max(64),
        purchaseDate: z.string().optional(),
        orderNumber: z.string().optional(),
        errorCode: z.string().max(64).optional(),
        problemDescription: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticketNo = await generateTicketNo();
      // Auto-generate or reuse customer number for this email
      const customerNo = await getOrCreateCustomerNo(input.customerEmail);
      await createTicket({
        ...input,
        ticketNo,
        customerNo,
        userId: ctx.user?.id ?? undefined,
        status: "pending",
      });

      // Fetch the created ticket to get its ID
      const ticket = await getTicketByNo(ticketNo);
      if (!ticket) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Notify owner via Manus notification
      await notifyOwner({
        title: `New Support Ticket: ${ticketNo}`,
        content: `Customer No: ${customerNo}\nCustomer: ${input.customerName} (${input.customerEmail})\nProduct: ${input.productModel}\nError Code: ${input.errorCode ?? "N/A"}\nDescription: ${input.problemDescription.slice(0, 200)}`,
      }).catch(() => {});

      return { ticketNo, ticketId: ticket.id, customerNo };
    }),

  // ── Upload attachment (called after submit, with ticketId) ─────────────────
  uploadAttachment: publicProcedure
    .input(
      z.object({
        ticketId: z.number(),
        ticketNo: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileDataBase64: z.string(),
        attachmentType: z.enum(["video", "photo", "other"]),
      })
    )
    .mutation(async ({ input }) => {
      // Verify ticket exists
      const ticket = await getTicketById(input.ticketId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

      // Decode base64 and upload to S3
      const buffer = Buffer.from(input.fileDataBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `tickets/${input.ticketNo}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { url } = await storagePut(fileKey, buffer, input.fileType);

      await addAttachment({
        ticketId: input.ticketId,
        fileKey,
        fileUrl: url,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        attachmentType: input.attachmentType,
      });

      return { url };
    }),

  // ── Customer: look up own tickets by email ─────────────────────────────────
  getMyTickets: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => getTicketByEmail(input.email)),

  // ── Customer: get ticket detail by ticketNo + email (no auth needed) ───────
  getTicketDetail: publicProcedure
    .input(z.object({ ticketNo: z.string(), email: z.string().email() }))
    .query(async ({ input }) => {
      const ticket = await getTicketByNo(input.ticketNo);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      if (ticket.customerEmail.toLowerCase() !== input.email.toLowerCase()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Email does not match" });
      }
      const attachments = await getAttachmentsByTicketId(ticket.id);
      const messages = await getMessagesByTicketId(ticket.id);
      return { ticket, attachments, messages };
    }),

  // ── Admin: list all tickets ────────────────────────────────────────────────
  adminListTickets: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(({ input }) => getAllTickets(input)),

  // ── Admin: get full ticket detail ─────────────────────────────────────────
  adminGetTicket: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const ticket = await getTicketById(input.id);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
      const attachments = await getAttachmentsByTicketId(ticket.id);
      const messages = await getMessagesByTicketId(ticket.id);
      return { ticket, attachments, messages };
    }),

  // ── Admin: update status + send diagnosis/solution ────────────────────────
  adminResolve: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["reviewing", "resolved", "rejected"]),
        adminDiagnosis: z.string().min(1),
        adminSolution: z.string().min(1),
        replacementDecision: z.enum(["none", "partial", "full"]).default("none"),
        messageToCustomer: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticket = await getTicketById(input.id);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });

      await updateTicketStatus(input.id, {
        status: input.status,
        adminDiagnosis: input.adminDiagnosis,
        adminSolution: input.adminSolution,
        replacementDecision: input.replacementDecision,
        adminId: ctx.user.id,
        resolvedAt: input.status === "resolved" ? new Date() : undefined,
      });

      // Save message in conversation
      await addMessage({
        ticketId: input.id,
        senderRole: "admin",
        senderName: "CoolDrivePro Support",
        content: input.messageToCustomer,
      });

      // Send email to customer
      const statusLabel =
        input.status === "resolved"
          ? "Resolved ✓"
          : input.status === "rejected"
          ? "Closed"
          : "Under Review";

      const replacementText =
        input.replacementDecision === "full"
          ? "\n\n🔧 Replacement Decision: Full replacement parts will be shipped to you."
          : input.replacementDecision === "partial"
          ? "\n\n🔧 Replacement Decision: Partial replacement parts will be shipped to you."
          : "";

      await sendCustomerEmail({
        toEmail: ticket.customerEmail,
        toName: ticket.customerName,
        ticketNo: ticket.ticketNo,
        subject: `[${ticket.ticketNo}] Your Support Ticket Has Been Updated – ${statusLabel}`,
        message: `Dear ${ticket.customerName},\n\nYour support ticket ${ticket.ticketNo} has been updated.\n\nStatus: ${statusLabel}\n\nDiagnosis:\n${input.adminDiagnosis}\n\nSolution:\n${input.adminSolution}${replacementText}\n\nMessage from our team:\n${input.messageToCustomer}\n\nYou can check your ticket status at:\nhttps://www.cooldrivepro.com/support/ticket?no=${ticket.ticketNo}\n\nBest regards,\nCoolDrivePro Support Team\nsupport@cooldrivepro.com`,
      });

      return { success: true };
    }),

  // ── Admin: mark as reviewing ───────────────────────────────────────────────
  adminMarkReviewing: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updateTicketStatus(input.id, { status: "reviewing" });
      return { success: true };
    }),
});
