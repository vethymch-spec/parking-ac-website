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

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
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

describe("forum router", () => {
  it("getCategories returns an array (may be empty if DB unavailable)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.forum.getCategories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getPosts returns posts and total", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.forum.getPosts({ page: 1, limit: 10 });
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.posts)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("createPost requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.forum.createPost({
        title: "Test post title here",
        content: "This is test content for the post that is long enough",
        categoryId: 1,
      })
    ).rejects.toThrow();
  });

  it("createReply requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.forum.createReply({ postId: 1, content: "Test reply" })
    ).rejects.toThrow();
  });

  it("likePost requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.forum.likePost({ postId: 1 })).rejects.toThrow();
  });

  it("updateProfile requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.forum.updateProfile({ name: "New Name" })).rejects.toThrow();
  });

  it("getMyPosts requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.forum.getMyPosts()).rejects.toThrow();
  });

  it("getReplies returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.forum.getReplies({ postId: 9999 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getPostBySlug throws NOT_FOUND for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.forum.getPostBySlug({ slug: "this-slug-does-not-exist-xyz123" })
    ).rejects.toThrow("Post not found");
  });
});
