import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  forumCategories,
  forumPosts,
  forumReplies,
  postLikes,
  replyLikes,
  users,
  type InsertForumPost,
  type InsertForumReply,
} from "../drizzle/schema";

// ─── Categories ────────────────────────────────────────────────────────────

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forumCategories).orderBy(forumCategories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(forumCategories).where(eq(forumCategories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

// ─── Posts ─────────────────────────────────────────────────────────────────

export async function getPostsList(opts: {
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };

  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (opts.categoryId) conditions.push(eq(forumPosts.categoryId, opts.categoryId));
  if (opts.search) {
    conditions.push(
      or(
        like(forumPosts.title, `%${opts.search}%`),
        like(forumPosts.content, `%${opts.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const posts = await db
    .select({
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      slug: forumPosts.slug,
      vehicleType: forumPosts.vehicleType,
      productModel: forumPosts.productModel,
      isPinned: forumPosts.isPinned,
      isClosed: forumPosts.isClosed,
      viewCount: forumPosts.viewCount,
      replyCount: forumPosts.replyCount,
      likeCount: forumPosts.likeCount,
      lastReplyAt: forumPosts.lastReplyAt,
      createdAt: forumPosts.createdAt,
      categoryId: forumPosts.categoryId,
      authorId: forumPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      authorVehicle: users.vehicleType,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(forumPosts.isPinned), desc(forumPosts.lastReplyAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(forumPosts)
    .where(whereClause);

  return { posts, total: Number(countResult[0]?.count ?? 0) };
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      slug: forumPosts.slug,
      vehicleType: forumPosts.vehicleType,
      productModel: forumPosts.productModel,
      isPinned: forumPosts.isPinned,
      isClosed: forumPosts.isClosed,
      viewCount: forumPosts.viewCount,
      replyCount: forumPosts.replyCount,
      likeCount: forumPosts.likeCount,
      lastReplyAt: forumPosts.lastReplyAt,
      createdAt: forumPosts.createdAt,
      updatedAt: forumPosts.updatedAt,
      categoryId: forumPosts.categoryId,
      authorId: forumPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      authorLocation: users.location,
      authorVehicle: users.vehicleType,
      authorBio: users.bio,
      authorCreatedAt: users.createdAt,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .where(eq(forumPosts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createPost(data: InsertForumPost) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(forumPosts).values(data);
  // increment category post count
  await db
    .update(forumCategories)
    .set({ postCount: sql`${forumCategories.postCount} + 1` })
    .where(eq(forumCategories.id, data.categoryId));
  return result;
}

export async function incrementPostView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(forumPosts)
    .set({ viewCount: sql`${forumPosts.viewCount} + 1` })
    .where(eq(forumPosts.id, id));
}

// ─── Replies ───────────────────────────────────────────────────────────────

export async function getRepliesByPostId(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: forumReplies.id,
      postId: forumReplies.postId,
      content: forumReplies.content,
      parentReplyId: forumReplies.parentReplyId,
      likeCount: forumReplies.likeCount,
      isAccepted: forumReplies.isAccepted,
      createdAt: forumReplies.createdAt,
      updatedAt: forumReplies.updatedAt,
      authorId: forumReplies.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      authorVehicle: users.vehicleType,
      authorLocation: users.location,
    })
    .from(forumReplies)
    .leftJoin(users, eq(forumReplies.authorId, users.id))
    .where(eq(forumReplies.postId, postId))
    .orderBy(forumReplies.createdAt);
}

export async function createReply(data: InsertForumReply) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(forumReplies).values(data);
  // update post reply count and lastReplyAt
  await db
    .update(forumPosts)
    .set({
      replyCount: sql`${forumPosts.replyCount} + 1`,
      lastReplyAt: new Date(),
    })
    .where(eq(forumPosts.id, data.postId));
  return result;
}

// ─── Likes ─────────────────────────────────────────────────────────────────

export async function togglePostLike(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    await db.update(forumPosts).set({ likeCount: sql`${forumPosts.likeCount} - 1` }).where(eq(forumPosts.id, postId));
    return { liked: false };
  } else {
    await db.insert(postLikes).values({ postId, userId });
    await db.update(forumPosts).set({ likeCount: sql`${forumPosts.likeCount} + 1` }).where(eq(forumPosts.id, postId));
    return { liked: true };
  }
}

export async function toggleReplyLike(replyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const existing = await db
    .select()
    .from(replyLikes)
    .where(and(eq(replyLikes.replyId, replyId), eq(replyLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(replyLikes).where(and(eq(replyLikes.replyId, replyId), eq(replyLikes.userId, userId)));
    await db.update(forumReplies).set({ likeCount: sql`${forumReplies.likeCount} - 1` }).where(eq(forumReplies.id, replyId));
    return { liked: false };
  } else {
    await db.insert(replyLikes).values({ replyId, userId });
    await db.update(forumReplies).set({ likeCount: sql`${forumReplies.likeCount} + 1` }).where(eq(forumReplies.id, replyId));
    return { liked: true };
  }
}

export async function getUserLikedPostIds(userId: number, postIds: number[]) {
  const db = await getDb();
  if (!db || postIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ postId: postLikes.postId })
    .from(postLikes)
    .where(and(eq(postLikes.userId, userId), sql`${postLikes.postId} IN (${sql.join(postIds.map(id => sql`${id}`), sql`, `)})`));
  return new Set(rows.map(r => r.postId));
}

// ─── User profile ──────────────────────────────────────────────────────────

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; location?: string; vehicleType?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserPosts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(forumPosts)
    .where(eq(forumPosts.authorId, userId))
    .orderBy(desc(forumPosts.createdAt))
    .limit(20);
}

// ─── Seed categories ───────────────────────────────────────────────────────

export async function seedCategoriesIfEmpty() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(forumCategories).limit(1);
  if (existing.length > 0) return;

  const cats = [
    { name: "Experience & Reviews", slug: "experience-reviews", description: "Share your real-world experience with parking AC systems", icon: "star", color: "#f59e0b", sortOrder: 1 },
    { name: "Installation Help", slug: "installation-help", description: "Questions and tips on installing your parking AC", icon: "wrench", color: "#3b82f6", sortOrder: 2 },
    { name: "Troubleshooting", slug: "troubleshooting", description: "Get help diagnosing and fixing issues", icon: "alert-triangle", color: "#ef4444", sortOrder: 3 },
    { name: "Solar & Battery Setup", slug: "solar-battery", description: "Discuss solar panels, battery banks, and power systems", icon: "zap", color: "#10b981", sortOrder: 4 },
    { name: "Van Life & RV Living", slug: "van-life-rv", description: "Life on the road, van builds, and RV tips", icon: "truck", color: "#8b5cf6", sortOrder: 5 },
    { name: "Product Comparison", slug: "product-comparison", description: "Compare different parking AC models and brands", icon: "bar-chart", color: "#06b6d4", sortOrder: 6 },
    { name: "General Discussion", slug: "general", description: "Anything else related to parking air conditioning", icon: "message-circle", color: "#6b7280", sortOrder: 7 },
  ];

  for (const cat of cats) {
    await db.insert(forumCategories).values(cat);
  }
}
