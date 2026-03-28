import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createPost,
  createReply,
  getAllCategories,
  getCategoryBySlug,
  getPostById,
  getPostBySlug,
  getPostsList,
  getRepliesByPostId,
  getUserLikedPostIds,
  getUserPosts,
  incrementPostView,
  seedCategoriesIfEmpty,
  togglePostLike,
  toggleReplyLike,
  updateUserProfile,
} from "../forum.db";

// Generate URL-friendly slug from title
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) +
    "-" +
    Date.now().toString(36)
  );
}

export const forumRouter = router({
  // ── Categories ─────────────────────────────────────────────────────────
  getCategories: publicProcedure.query(async () => {
    await seedCategoriesIfEmpty();
    return getAllCategories();
  }),

  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getCategoryBySlug(input.slug)),

  // ── Posts ───────────────────────────────────────────────────────────────
  getPosts: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(({ input }) => getPostsList(input)),

  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await getPostBySlug(input.slug);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      await incrementPostView(post.id);
      return post;
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        content: z.string().min(20),
        categoryId: z.number(),
        vehicleType: z.string().optional(),
        productModel: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.title);
      await createPost({
        title: input.title,
        content: input.content,
        categoryId: input.categoryId,
        authorId: ctx.user.id,
        slug,
        vehicleType: input.vehicleType,
        productModel: input.productModel,
      });
      return { slug };
    }),

  likePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(({ input, ctx }) => togglePostLike(input.postId, ctx.user.id)),

  getUserLikedPosts: protectedProcedure
    .input(z.object({ postIds: z.array(z.number()) }))
    .query(({ input, ctx }) => getUserLikedPostIds(ctx.user.id, input.postIds)),

  // ── Replies ─────────────────────────────────────────────────────────────
  getReplies: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(({ input }) => getRepliesByPostId(input.postId)),

  createReply: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(5),
        parentReplyId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // verify post exists and is not closed
      const post = await getPostById(input.postId);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (post.isClosed) throw new TRPCError({ code: "FORBIDDEN", message: "This thread is closed" });

      await createReply({
        postId: input.postId,
        authorId: ctx.user.id,
        content: input.content,
        parentReplyId: input.parentReplyId,
      });
      return { success: true };
    }),

  likeReply: protectedProcedure
    .input(z.object({ replyId: z.number() }))
    .mutation(({ input, ctx }) => toggleReplyLike(input.replyId, ctx.user.id)),

  // ── User profile ─────────────────────────────────────────────────────────
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(64).optional(),
        bio: z.string().max(300).optional(),
        location: z.string().max(128).optional(),
        vehicleType: z.string().max(64).optional(),
      })
    )
    .mutation(({ input, ctx }) => updateUserProfile(ctx.user.id, input)),

  getMyPosts: protectedProcedure.query(({ ctx }) => getUserPosts(ctx.user.id)),
});
