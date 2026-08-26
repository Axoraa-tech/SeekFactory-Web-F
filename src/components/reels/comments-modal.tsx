"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageSquare, Send, ChevronDown, ChevronUp, CornerDownRight, CheckCircle2 } from "lucide-react";
import type { ReelComment } from "@/entities/comment";
import { getApi } from "@/shared/api";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Props = {
  reelId: string;
  reelTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
};

const PAGE_SIZE = 4;

export function CommentsModal({
  reelId,
  reelTitle,
  isOpen,
  onClose,
  onCommentAdded,
}: Props) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Replying state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Expanded replies state
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Liked comments & replies set
  const [likedMap, setLikedMap] = useState<Record<string, { liked: boolean; count: number }>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load comments
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);

    getApi()
      .comments.listByReelId(reelId)
      .then((data) => {
        if (!mounted) return;
        setComments(data);
        setVisibleCount(PAGE_SIZE);
        setLoading(false);

        // initialize like map
        const map: Record<string, { liked: boolean; count: number }> = {};
        data.forEach((c) => {
          map[c.id] = { liked: false, count: c.likes };
          c.replies.forEach((r) => {
            map[r.id] = { liked: false, count: r.likes };
          });
        });
        setLikedMap(map);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, reelId]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCommentCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  const handleToggleLike = (id: string, initialCount: number) => {
    setLikedMap((prev) => {
      const current = prev[id] || { liked: false, count: initialCount };
      const nextLiked = !current.liked;
      return {
        ...prev,
        [id]: {
          liked: nextLiked,
          count: nextLiked ? current.count + 1 : Math.max(0, current.count - 1),
        },
      };
    });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const added = await getApi().comments.addComment(reelId, newCommentText.trim());
      setComments((prev) => [added, ...prev]);
      setLikedMap((prev) => ({ ...prev, [added.id]: { liked: false, count: 0 } }));
      setNewCommentText("");
      onCommentAdded?.();
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const reply = await getApi().comments.addReply(commentId, replyText.trim());
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const exists = (c.replies || []).some((r) => r.id === reply.id);
          return {
            ...c,
            replies: exists ? c.replies : [...(c.replies || []), reply],
          };
        })
      );
      setLikedMap((prev) => ({ ...prev, [reply.id]: { liked: false, count: 0 } }));
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      setReplyText("");
      setReplyingToId(null);
      onCommentAdded?.();
    } catch {
      // handled
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-xl max-h-[85vh] sm:max-h-[750px] bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">Comments</h2>
              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                {totalCommentCount}
              </span>
            </div>
            <p className="text-xs text-ink-muted truncate max-w-md mt-0.5">{reelTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comment Input Bar at Top */}
        <form
          onSubmit={handlePostComment}
          className="flex items-center gap-3 px-5 py-3.5 border-b border-line bg-canvas/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
            alt="Current user"
            className="h-9 w-9 rounded-full object-cover border border-line flex-shrink-0"
          />
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a manufacturing comment..."
              className="w-full rounded-full border border-line bg-surface px-4 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition pr-10"
            />
            {newCommentText.trim().length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm hover:bg-brand-blue-dark transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 divide-y divide-line/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-muted">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent mb-2" />
              <p className="text-xs">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted">
              <MessageSquare className="h-10 w-10 text-ink-faint mb-2" />
              <p className="text-sm font-semibold text-ink">No comments yet</p>
              <p className="text-xs text-ink-muted mt-1">
                Be the first verified buyer or engineer to start the discussion!
              </p>
            </div>
          ) : (
            visibleComments.map((comment) => {
              const commentLikedState = likedMap[comment.id] || {
                liked: false,
                count: comment.likes,
              };
              const isReplying = replyingToId === comment.id;
              const hasReplies = comment.replies && comment.replies.length > 0;
              const isRepliesExpanded = expandedReplies[comment.id] ?? false;

              return (
                <div key={comment.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={comment.authorAvatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border border-line flex-shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      {/* Author Info */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-ink hover:underline cursor-pointer">
                          {comment.authorName}
                        </span>
                        {comment.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-blue fill-brand-blue/10 flex-shrink-0" />
                        )}
                        {comment.authorCompany && (
                          <span className="text-[11px] text-ink-muted truncate max-w-[180px]">
                            • {comment.authorCompany}
                          </span>
                        )}
                        <span className="text-[10px] text-ink-faint ml-auto">
                          {comment.createdAt}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-ink mt-1 leading-relaxed break-words">
                        {comment.content}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-ink-muted">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id, comment.likes)}
                          className={cn(
                            "flex items-center gap-1 font-semibold transition hover:text-ink",
                            commentLikedState.liked && "text-red-500 hover:text-red-600"
                          )}
                        >
                          <Heart
                            className={cn(
                              "h-3.5 w-3.5",
                              commentLikedState.liked && "fill-red-500 text-red-500"
                            )}
                          />
                          <span>{formatCount(commentLikedState.count)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(isReplying ? null : comment.id);
                            setReplyText("");
                          }}
                          className="font-semibold hover:text-brand-blue transition"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Inline Reply Form */}
                      {isReplying && (
                        <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-canvas border border-line animate-in fade-in duration-150">
                          <CornerDownRight className="h-4 w-4 text-ink-muted flex-shrink-0 ml-1" />
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to @${comment.authorName}...`}
                            className="flex-1 rounded-lg border-0 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handlePostReply(comment.id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyText.trim() || isSubmittingReply}
                            className="rounded-lg bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-blue-dark transition disabled:opacity-50"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="text-xs text-ink-muted hover:text-ink px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Threaded Replies Accordion */}
                      {hasReplies && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReplies((prev) => ({
                                ...prev,
                                [comment.id]: !isRepliesExpanded,
                              }))
                            }
                            className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue hover:text-brand-blue-dark transition"
                          >
                            <div className="h-0.5 w-4 bg-brand-blue/40" />
                            {isRepliesExpanded ? (
                              <>
                                <span>Hide replies</span>
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>
                                  View {comment.replies.length}{" "}
                                  {comment.replies.length === 1 ? "reply" : "replies"}
                                </span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>

                          {isRepliesExpanded && (
                            <div className="mt-2.5 space-y-3 pl-4 border-l-2 border-line ml-2">
                              {comment.replies.map((reply) => {
                                const replyLikedState = likedMap[reply.id] || {
                                  liked: false,
                                  count: reply.likes,
                                };
                                return (
                                  <div key={reply.id} className="flex items-start gap-2.5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={reply.authorAvatarUrl}
                                      alt=""
                                      className="h-6 w-6 rounded-full object-cover border border-line flex-shrink-0 mt-0.5"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-ink">
                                          {reply.authorName}
                                        </span>
                                        {reply.isVerified && (
                                          <CheckCircle2 className="h-3 w-3 text-brand-blue fill-brand-blue/10 flex-shrink-0" />
                                        )}
                                        {reply.authorCompany && (
                                          <span className="text-[10px] text-ink-muted truncate max-w-[140px]">
                                            • {reply.authorCompany}
                                          </span>
                                        )}
                                        <span className="text-[10px] text-ink-faint ml-auto">
                                          {reply.createdAt}
                                        </span>
                                      </div>
                                      <p className="text-xs text-ink mt-0.5 leading-relaxed">
                                        {reply.content}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleLike(reply.id, reply.likes)}
                                        className={cn(
                                          "flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-ink-muted hover:text-ink transition",
                                          replyLikedState.liked && "text-red-500 hover:text-red-600"
                                        )}
                                      >
                                        <Heart
                                          className={cn(
                                            "h-3 w-3",
                                            replyLikedState.liked && "fill-red-500 text-red-500"
                                          )}
                                        />
                                        <span>{formatCount(replyLikedState.count)}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination / Load More Comments */}
          {hasMore && !loading && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="rounded-full border border-line bg-canvas px-4 py-1.5 text-xs font-semibold text-ink hover:bg-surface hover:border-brand-blue hover:text-brand-blue shadow-sm transition"
              >
                Load {Math.min(PAGE_SIZE, comments.length - visibleCount)} more comments (
                {comments.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
