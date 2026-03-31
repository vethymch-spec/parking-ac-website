import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Clock,
  ArrowLeft,
  Send,
  MapPin,
  Truck,
  CheckCircle2,
  Pin,
} from "lucide-react";

function timeAgo(date: Date | string, t: any): string {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return t('forum.justNow');
  if (diff < 3600) return t('forum.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('forum.hoursAgo', { count: Math.floor(diff / 3600) });
  if (diff < 2592000) return t('forum.daysAgo', { count: Math.floor(diff / 86400) });
  return d.toLocaleDateString();
}

function Avatar({ name, size = "md" }: { name?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0`}>
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function ForumPostPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | undefined>();

  const utils = trpc.useUtils();

  const { data: post, isLoading: postLoading } = trpc.forum.getPostBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const { data: replies, isLoading: repliesLoading } = trpc.forum.getReplies.useQuery(
    { postId: post?.id ?? 0 },
    { enabled: !!post?.id }
  );

  const likePost = trpc.forum.likePost.useMutation({
    onSuccess: () => utils.forum.getPostBySlug.invalidate({ slug: slug ?? "" }),
    onError: () => toast.error(t('forum.errorLikePost', 'Failed to like post')),
  });

  const likeReply = trpc.forum.likeReply.useMutation({
    onSuccess: () => utils.forum.getReplies.invalidate({ postId: post?.id ?? 0 }),
    onError: () => toast.error(t('forum.errorLikeReply', 'Failed to like reply')),
  });

  const createReply = trpc.forum.createReply.useMutation({
    onSuccess: () => {
      setReplyContent("");
      setReplyingTo(undefined);
      utils.forum.getReplies.invalidate({ postId: post?.id ?? 0 });
      utils.forum.getPostBySlug.invalidate({ slug: slug ?? "" });
      toast.success(t('forum.replyPosted', 'Reply posted!'));
    },
    onError: (err) => toast.error(err.message || t('forum.errorReply', 'Failed to post reply')),
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    createReply.mutate({
      postId: post.id,
      content: replyContent,
      parentReplyId: replyingTo,
    });
  };

  if (postLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('forum.postNotFound', 'Post Not Found')}</h2>
            <Link href="/forum"><Button>{t('forum.backToForum', 'Back to Forum')}</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-12 flex-1">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/forum" className="hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> {t('nav.forum')}
            </Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{post.title}</span>
          </div>

          {/* Post card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            {/* Post header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-2 flex-wrap mb-3">
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Pin className="w-3 h-3" /> {t('forum.pinned')}
                  </span>
                )}
                {post.isClosed && <Badge variant="secondary">{t('forum.closed')}</Badge>}
                {post.vehicleType && (
                  <Badge variant="outline" className="border-blue-200 text-blue-600 text-xs">
                    <Truck className="w-3 h-3 mr-1" />{post.vehicleType}
                  </Badge>
                )}
                {post.productModel && (
                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                    {post.productModel}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">{post.title}</h1>

              {/* Author info */}
              <div className="flex items-center gap-3 mt-4">
                <Avatar name={post.authorName} size="md" />
                <div>
                  <p className="font-semibold text-gray-700">{post.authorName ?? t('forum.anonymous', "Anonymous")}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(post.createdAt, t)}
                    </span>
                    {post.authorLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {post.authorLocation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.replyCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Post content */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Post actions */}
            <div className="px-6 pb-4 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                  likePost.mutate({ postId: post.id });
                }}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likeCount ?? 0} {t('forum.helpful', 'Helpful')}</span>
              </Button>
            </div>
          </div>

          {/* Replies */}
          <div className="mb-4">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {post.replyCount ?? 0} {post.replyCount === 1 ? t('forum.reply', 'Reply') : t('forum.replies', 'Replies')}
            </h2>

            {repliesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : replies && replies.length > 0 ? (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`bg-white rounded-xl border shadow-sm p-4 ${
                      reply.isAccepted ? "border-green-300 bg-green-50/30" : "border-gray-200"
                    } ${reply.parentReplyId ? "ml-8 border-l-4 border-l-blue-200" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={reply.authorName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-700 text-sm">{reply.authorName ?? t('forum.anonymous')}</span>
                          {reply.authorVehicle && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {reply.authorVehicle}
                            </span>
                          )}
                          {reply.isAccepted && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> {t('forum.acceptedAnswer', 'Accepted Answer')}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">{timeAgo(reply.createdAt, t)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                              likeReply.mutate({ replyId: reply.id });
                            }}
                          >
                            <ThumbsUp className="w-3 h-3" /> {reply.likeCount ?? 0}
                          </button>
                          {!post.isClosed && isAuthenticated && (
                            <button
                              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                              onClick={() => setReplyingTo(reply.id)}
                            >
                              {t('forum.replyBtn', 'Reply')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t('forum.noRepliesYet', 'No replies yet. Be the first to respond!')}</p>
              </div>
            )}
          </div>

          {/* Reply form */}
          {!post.isClosed && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                {replyingTo ? t('forum.writeReply', 'Write a Reply') : t('forum.joinDiscussion', 'Join the Discussion')}
              </h3>
              {replyingTo && (
                <div className="flex items-center gap-2 mb-3 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  {t('forum.replyingTo', 'Replying to a comment')}
                  <button className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setReplyingTo(undefined)}>
                    ✕
                  </button>
                </div>
              )}
              {isAuthenticated ? (
                <form onSubmit={handleReplySubmit} className="space-y-3">
                  <Textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder={t('forum.shareExperience', 'Share your experience or answer...')}
                    className="min-h-[120px] resize-y"
                    required
                    minLength={5}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={createReply.isPending || replyContent.length < 5}
                      className="gap-2"
                    >
                      {createReply.isPending ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> {t('common.posting', 'Posting...')}</>
                      ) : (
                        <><Send className="w-4 h-4" /> {t('forum.postReply', 'Post Reply')}</>
                      )}
                    </Button>
                    {replyingTo && (
                      <Button type="button" variant="outline" onClick={() => setReplyingTo(undefined)}>
                        {t('common.cancel', 'Cancel')}
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">{t('forum.signInToJoin', 'Sign in to join the discussion')}</p>
                  <a href={getLoginUrl()}>
                    <Button>{t('forum.signInReply', 'Sign In to Reply')}</Button>
                  </a>
                </div>
              )}
            </div>
          )}

          {post.isClosed && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm">
              {t('forum.threadClosed', 'This thread is closed and no longer accepting replies.')}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
