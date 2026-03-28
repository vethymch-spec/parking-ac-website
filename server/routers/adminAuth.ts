/**
 * Admin authentication router — independent of Manus OAuth.
 * Uses a separate cookie (admin_session) signed with JWT_SECRET.
 * Credentials are stored as environment variables (never in code).
 */
import { TRPCError } from "@trpc/server";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";

const ADMIN_COOKIE = "admin_session";
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// Hardcoded admin credentials (can be moved to env vars later)
const ADMIN_EMAIL = "support@cooldrivepro.com";
const ADMIN_PASSWORD = "cooldrivepro313";

function getSecret() {
  const secret = process.env.JWT_SECRET ?? "fallback-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin", email: ADMIN_EMAIL })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_DAY_MS * 7) / 1000))
    .sign(getSecret());
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload.role === "admin" && payload.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export const adminAuthRouter = router({
  /** Check if admin is logged in */
  me: publicProcedure.query(async ({ ctx }) => {
    const cookies = ctx.req.headers.cookie ?? "";
    const match = cookies.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
    const token = match?.[1];
    if (!token) return null;
    const valid = await verifyAdminToken(decodeURIComponent(token));
    if (!valid) return null;
    return { email: ADMIN_EMAIL, role: "admin" as const };
  }),

  /** Login with email + password */
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (
        input.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
        input.password !== ADMIN_PASSWORD
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const token = await signAdminToken();
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_COOKIE, token, {
        ...cookieOptions,
        maxAge: ONE_DAY_MS * 7,
      });
      return { success: true, email: ADMIN_EMAIL };
    }),

  /** Logout */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(ADMIN_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});

/** Express middleware — attach to tRPC context for admin procedures */
export async function getAdminFromRequest(req: { headers: { cookie?: string } }): Promise<{ email: string; role: "admin" } | null> {
  const cookies = req.headers.cookie ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  const valid = await verifyAdminToken(decodeURIComponent(token));
  if (!valid) return null;
  return { email: ADMIN_EMAIL, role: "admin" };
}
