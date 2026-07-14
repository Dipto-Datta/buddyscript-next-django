"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Comment, Reply } from "../types";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../lib/auth";

interface CommentSectionProps {
  postId: number;
  commentCount: number;
  onCommentCountUpdated: (count: number) => void;
}

export default function CommentSection({
  postId,
  commentCount,
  onCommentCountUpdated,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursorUrl, setNextCursorUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (url: string = `/posts/${postId}/comments/`) => {
    setLoading(true);
    try {
      const response = await api.get(url);
      if (url === `/posts/${postId}/comments/`) {
        setComments(response.results);
      } else {
        setComments((prev) => [...prev, ...response.results]);
      }
      setNextCursorUrl(response.next);
    } catch (err) {
      console.error("Failed to load comments", err);
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post(`/posts/${postId}/comments/`, {
        content: newCommentContent,
      });
      setComments((prev) => [response, ...prev]);
      setNewCommentContent("");
      onCommentCountUpdated(commentCount + 1);
    } catch (err: any) {
      setError("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyAdded = (commentId: number, reply: Reply) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...c.replies, reply],
          };
        }
        return c;
      })
    );
    onCommentCountUpdated(commentCount + 1);
  };

  const handleCommentLiked = (
    id: number,
    isReply: boolean,
    liked: boolean,
    likeCount: number,
    userReaction: string | null,
    reactionCounts: Record<string, number>
  ) => {
    setComments((prev) =>
      prev.map((c) => {
        if (isReply) {
          const hasReply = c.replies.some((r) => r.id === id);
          if (hasReply) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === id
                  ? {
                    ...r,
                    is_liked: liked,
                    like_count: likeCount,
                    user_reaction: userReaction,
                    reaction_counts: reactionCounts,
                  }
                  : r
              ),
            };
          }
        } else {
          if (c.id === id) {
            return {
              ...c,
              is_liked: liked,
              like_count: likeCount,
              user_reaction: userReaction,
              reaction_counts: reactionCounts,
            };
          }
        }
        return c;
      })
    );
  };

  const handleLoadMore = () => {
    if (nextCursorUrl) {
      const urlObj = new URL(nextCursorUrl);
      let relativePath = urlObj.pathname + urlObj.search;
      if (relativePath.startsWith("/api/")) {
        relativePath = relativePath.slice(4);
      }
      fetchComments(relativePath);
    }
  };

  const myAvatarUrl = user?.avatar || "/assets/images/comment_img.png";
  const myInitials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "US";

  return (
    <div className="space-y-4 pt-4">

      <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center">
        <Avatar className="h-8 w-8 border border-slate-100 dark:border-slate-800">
          <AvatarImage src={myAvatarUrl} style={{ objectFit: "cover" }} />
          <AvatarFallback>{myInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Write a comment..."
            className="flex-1 h-9 rounded-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-1"
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={submitting || !newCommentContent.trim()}
            className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            Post
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-xs text-red-500 dark:text-red-400">
          {error}
        </div>
      )}


      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onCommentLiked={handleCommentLiked}
            onReplyAdded={handleReplyAdded}
          />
        ))}


        {nextCursorUrl && (
          <div className="text-left pl-11">
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "View previous comments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
