"use client";

import { Heart, ChevronDown, ChevronUp, CornerDownRight, CheckCircle2 } from "lucide-react";
import type { ReelComment } from "@/entities/comment";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type LikedState = { liked: boolean; count: number };

type Props = {
  comment: ReelComment;
  likedMap: Record<string, LikedState>;
  replyingToId: string | null;
  replyText: string;
  isSubmittingReply: boolean;
  isRepliesExpanded: boolean;
  onToggleLike: (id: string, initialCount: number) => void;
  onToggleReply: (commentId: string) => void;
  onReplyTextChange: (value: string) => void;
  onPostReply: (commentId: string) => void;
  onCancelReply: () => void;
  onToggleRepliesExpanded: (commentId: string) => void;
};

export function CommentThreadItem({
  comment,
  likedMap,
  replyingToId,
  replyText,
  isSubmittingReply,
  isRepliesExpanded,
  onToggleLike,
  onToggleReply,
  onReplyTextChange,
  onPostReply,
  onCancelReply,
  onToggleRepliesExpanded,
}: Props) {
  const commentLikedState = likedMap[comment.id] || {
    liked: false,
    count: comment.likes,
  };
  const isReplying = replyingToId === comment.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="pt-4 first:pt-0">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comment.authorAvatarUrl}
          alt=""
          className="h-8 w-8 rounded-full object-cover border border-line flex-shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
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
            <span className="text-[10px] text-ink-faint ml-auto">{comment.createdAt}</span>
          </div>

          <p className="text-xs text-ink mt-1 leading-relaxed break-words">{comment.content}</p>

          <div className="flex items-center gap-4 mt-2 text-[11px] text-ink-muted">
            <button
              type="button"
              onClick={() => onToggleLike(comment.id, comment.likes)}
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
              onClick={() => onToggleReply(comment.id)}
              className="font-semibold hover:text-brand-blue transition"
            >
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-canvas border border-line animate-in fade-in duration-150">
              <CornerDownRight className="h-4 w-4 text-ink-muted flex-shrink-0 ml-1" />
              <input
                type="text"
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`Reply to @${comment.authorName}...`}
                className="flex-1 rounded-lg border-0 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onPostReply(comment.id);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => onPostReply(comment.id)}
                disabled={!replyText.trim() || isSubmittingReply}
                className="rounded-lg bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-blue-dark transition disabled:opacity-50"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={onCancelReply}
                className="text-xs text-ink-muted hover:text-ink px-1"
              >
                Cancel
              </button>
            </div>
          )}

          {hasReplies && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => onToggleRepliesExpanded(comment.id)}
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
                            <span className="text-xs font-bold text-ink">{reply.authorName}</span>
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
                          <p className="text-xs text-ink mt-0.5 leading-relaxed">{reply.content}</p>
                          <button
                            type="button"
                            onClick={() => onToggleLike(reply.id, reply.likes)}
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
}
