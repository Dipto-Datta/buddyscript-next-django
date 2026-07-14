"use client";

import React, { useState } from "react";
import { api } from "../lib/api";
import { Comment, Reply } from "../types";
import LikersModal from "./LikersModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ThumbsUp } from "lucide-react";

const reactionDetails: Record<string, { emoji: string; label: string; colorClass: string; bgClass: string }> = {
  Like: { emoji: "👍", label: "Like", colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500" },
  Love: { emoji: "❤️", label: "Love", colorClass: "text-rose-600 dark:text-rose-400", bgClass: "bg-rose-500" },
  Angry: { emoji: "😡", label: "Angry", colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-500" },
  Haha: { emoji: "😆", label: "Haha", colorClass: "text-amber-500 dark:text-amber-400", bgClass: "bg-amber-500" },
};

interface CommentItemProps {
  comment: Comment | Reply;
  isReply?: boolean;
  parentAuthorName?: string;
  onCommentLiked?: (
    id: number,
    isReply: boolean,
    liked: boolean,
    likeCount: number,
    userReaction: string | null,
    reactionCounts: Record<string, number>
  ) => void;
  onReplyAdded?: (commentId: number, reply: Reply) => void;
}

export default function CommentItem({
  comment,
  isReply = false,
  parentAuthorName,
  onCommentLiked,
  onReplyAdded,
}: CommentItemProps) {
  const [liked, setLiked] = useState(comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [userReaction, setUserReaction] = useState<string | null>(comment.user_reaction || null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(comment.reaction_counts || {});
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likersModalOpen, setLikersModalOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleReact = async (reactionType: string) => {
    try {
      const response = await api.post(`/comments/${comment.id}/like/`, { reaction_type: reactionType });
      setLiked(response.liked);
      setLikeCount(response.like_count);
      setUserReaction(response.user_reaction);
      setReactionCounts(response.reaction_counts || {});
      if (onCommentLiked) {
        onCommentLiked(
          comment.id,
          isReply,
          response.liked,
          response.like_count,
          response.user_reaction,
          response.reaction_counts
        );
      }
    } catch (error) {
      console.error("Reaction failed", error);
    }
  };

  const handleLikeToggle = async () => {
    const targetReaction = userReaction || "Like";
    await handleReact(targetReaction);
  };

  const getTopReactions = () => {
    return Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reaction]) => reaction);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const response = await api.post(`/comments/${comment.id}/reply/`, {
        content: replyContent,
      });
      setReplyContent("");
      setReplyInputOpen(false);
      if (onReplyAdded) {
        onReplyAdded(comment.id, response);
      }
    } catch (error) {
      console.error("Reply submission failed", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const avatarUrl = comment.author.avatar || "/assets/images/comment_img.png";
  const initials = `${comment.author.first_name?.[0] || ""}${comment.author.last_name?.[0] || ""}`.toUpperCase() || "U";

  const diffMs = Date.now() - new Date(comment.created_at).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const formattedTime = diffMins < 60 ? `${diffMins}m` : `${Math.floor(diffMins / 60)}h`;

  return (
    <div className="flex gap-3 text-left">
      <Avatar className="h-8 w-8 border border-slate-100 dark:border-slate-800 mt-0.5">
        <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 relative">
        <div className="relative inline-block max-w-full group">


          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3.5 py-2 inline-block max-w-full text-sm text-slate-800 dark:text-slate-200">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-50 mb-0.5">
              {comment.author.full_name}
            </h4>
            <p className="leading-normal break-words">
              {isReply && parentAuthorName && (
                <span className="font-bold text-slate-900 dark:text-slate-50 mr-1.5">
                  {parentAuthorName}
                </span>
              )}
              {comment.content}
            </p>
          </div>


          {likeCount > 0 && (
            <div
              onClick={() => setLikersModalOpen(true)}
              className="absolute -bottom-2 right-2 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-1.5 py-0.5 shadow-sm text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none z-10"
            >
              <div className="flex -space-x-1">
                {getTopReactions().map((reaction) => (
                  <span
                    key={reaction}
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${reactionDetails[reaction]?.bgClass} text-[8px] text-white ring-1 ring-white dark:ring-slate-900`}
                  >
                    {reactionDetails[reaction]?.emoji}
                  </span>
                ))}
              </div>
              <span className="font-medium">{likeCount}</span>
            </div>
          )}

        </div>


        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pl-3 select-none">
          <div
            className="relative"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >

            {showReactions && (
              <div className="absolute bottom-full left-0 pb-1.5 z-30 animate-in fade-in slide-in-from-bottom-1 duration-150">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1">
                  {Object.entries(reactionDetails).map(([type, { emoji, label }]) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleReact(type);
                        setShowReactions(false);
                      }}
                      className="hover:scale-150 hover:-translate-y-0.5 transform transition-all duration-200 ease-out p-0.5 rounded-full text-sm focus:outline-none origin-bottom"
                      title={label}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLikeToggle}
              className={`hover:underline cursor-pointer ${userReaction ? reactionDetails[userReaction]?.colorClass : ""
                }`}
            >
              {userReaction ? reactionDetails[userReaction]?.label : "Like"}
            </button>
          </div>

          {!isReply && (
            <button
              type="button"
              onClick={() => setReplyInputOpen(!replyInputOpen)}
              className="hover:underline cursor-pointer"
            >
              Reply
            </button>
          )}
          <button type="button" className="hover:underline cursor-pointer">
            Share
          </button>
          <span className="text-[10px] text-slate-400 font-normal">
            {formattedTime}
          </span>
        </div>


        {!isReply && "replies" in comment && comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 pt-3 pl-2 border-l border-slate-100 dark:border-slate-800/80 mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                parentAuthorName={comment.author.full_name}
                onCommentLiked={onCommentLiked}
              />
            ))}
          </div>
        )}


        {replyInputOpen && (
          <div className="flex items-center gap-2 pt-2">
            <form className="flex-1 flex gap-2" onSubmit={handleReplySubmit}>
              <Input
                type="text"
                placeholder={`Reply to ${comment.author.full_name}...`}
                className="flex-1 h-8 rounded-full bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs focus-visible:ring-1"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={submittingReply}
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
              >
                Reply
              </Button>
            </form>
          </div>
        )}

      </div>

      <LikersModal
        isOpen={likersModalOpen}
        onClose={() => setLikersModalOpen(false)}
        targetId={comment.id}
        targetType="comment"
      />
    </div>
  );
}
