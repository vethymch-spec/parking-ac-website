import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { forumRouter } from "./routers/forum";
import { ticketRouter } from "./routers/ticket";
import { customerRouter } from "./routers/customer";
import { adminAuthRouter } from "./routers/adminAuth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  forum: forumRouter,
  ticket: ticketRouter,
  customer: customerRouter,
  adminAuth: adminAuthRouter,
});

export type AppRouter = typeof appRouter;
