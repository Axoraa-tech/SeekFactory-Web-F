"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageSquare } from "lucide-react";
import type { ReelComment } from "@/entities/comment";
import { getApi } from "@/shared/api";
import { ApiError } from "@/shared/api/http-api";
import { useRequireSignIn } from "@/features/engagement/use-engagement";
import { pauseAllSeeks } from "@/hooks/use-seek-autoplay";
import { CommentComposer } from "./comment-composer";
import { CommentThreadItem } from "./comment-thread-item";

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

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const [likedMap, setLikedMap] = useState<Record<string, { liked: boolean; count: number }>>({});

  const [actionError, setActionError] = useState<string | null>(null);
  const requireSignIn = useRequireSignIn();

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    pauseAllSeeks();

    let mounted = true;
    setLoading(true);

    getApi()
      .comments.listByReelId(reelId)
      .then((data) => {
        if (!mounted) return;
        setComments(data);
        setVisibleCount(PAGE_SIZE);
        setLoading(false);

        const map: Record<string, { liked: boolean; count: number }> = {};
        data.forEach((c) => {
          map[c.id] = { liked: Boolean(c.likedByMe), count: c.likes };
          c.replies.forEach((r) => {
            map[r.id] = { liked: Boolean(r.likedByMe), count: r.likes };
          });
        });
        setLikedMap(map);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setLoading(false);
        setActionError(err instanceof Error ? err.message : "Could not load comments");
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, reelId]);

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

  /** Guests are sent to sign in; any other failure is shown above the composer. */
  const handleActionError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError && err.status === 401) {
      requireSignIn();
      return;
    }
    setActionError(err instanceof Error ? err.message : fallback);
  };

  const handleToggleLike = async (id: string, initialCount: number) => {
    const current = likedMap[id] || { liked: false, count: initialCount };
    const nextLiked = !current.liked;
    setLikedMap((prev) => ({
      ...prev,
      [id]: { liked: nextLiked, count: Math.max(0, current.count + (nextLiked ? 1 : -1)) },
    }));
    try {
      const res = await getApi().comments.toggleLike(id);
      setLikedMap((prev) => ({ ...prev, [id]: { liked: res.liked, count: res.likes } }));
    } catch (err) {
      setLikedMap((prev) => ({ ...prev, [id]: current }));
      handleActionError(err, "Could not update like");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      const added = await getApi().comments.addComment(reelId, newCommentText.trim());
      setComments((prev) => [added, ...prev]);
      setLikedMap((prev) => ({ ...prev, [added.id]: { liked: false, count: 0 } }));
      setNewCommentText("");
      onCommentAdded?.();
    } catch (err) {
      handleActionError(err, "Could not post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    setActionError(null);
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
    } catch (err) {
      handleActionError(err, "Could not post reply");
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

        <CommentComposer
          inputRef={inputRef}
          value={newCommentText}
          onChange={setNewCommentText}
          onSubmit={handlePostComment}
          isSubmitting={isSubmitting}
        />

        {actionError && (
          <p role="alert" className="px-5 py-2 text-xs font-semibold text-rose-600 border-b border-line bg-rose-50">
            {actionError}
          </p>
        )}

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
            visibleComments.map((comment) => (
              <CommentThreadItem
                key={comment.id}
                comment={comment}
                likedMap={likedMap}
                replyingToId={replyingToId}
                replyText={replyText}
                isSubmittingReply={isSubmittingReply}
                isRepliesExpanded={expandedReplies[comment.id] ?? false}
                onToggleLike={handleToggleLike}
                onToggleReply={(commentId) => {
                  setReplyingToId(replyingToId === commentId ? null : commentId);
                  setReplyText("");
                }}
                onReplyTextChange={setReplyText}
                onPostReply={handlePostReply}
                onCancelReply={() => setReplyingToId(null)}
                onToggleRepliesExpanded={(commentId) =>
                  setExpandedReplies((prev) => ({
                    ...prev,
                    [commentId]: !(prev[commentId] ?? false),
                  }))
                }
              />
            ))
          )}

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
