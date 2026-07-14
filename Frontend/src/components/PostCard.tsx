"use client";

import React, { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Post } from "../types";
import CommentSection from "./CommentSection";
import LikersModal from "./LikersModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Bookmark,
  Bell,
  EyeOff,
  Edit3,
  Trash2,
  MessageSquare,
  Share2,
  Smile,
  Globe,
  Lock
} from "lucide-react";

const reactionDetails: Record<string, { emoji: string; label: string; colorClass: string; bgClass: string }> = {
  Like: { emoji: "👍", label: "Like", colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500" },
  Love: { emoji: "❤️", label: "Love", colorClass: "text-rose-600 dark:text-rose-400", bgClass: "bg-rose-500" },
  Angry: { emoji: "😡", label: "Angry", colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-500" },
  Haha: { emoji: "😆", label: "Haha", colorClass: "text-amber-500 dark:text-amber-400", bgClass: "bg-amber-500" },
};

interface PostCardProps {
  post: Post;
  onPostDeleted?: (id: number) => void;
  triggerToast?: (message: string) => void;
}

export default function PostCard({ post, onPostDeleted, triggerToast }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [userReaction, setUserReaction] = useState<string | null>(post.user_reaction || null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(post.reaction_counts || {});
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likersModalOpen, setLikersModalOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [visibility, setVisibility] = useState(post.visibility);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleReact = async (reactionType: string) => {
    try {
      const response = await api.post(`/posts/${post.id}/like/`, { reaction_type: reactionType });
      setLiked(response.liked);
      setLikeCount(response.like_count);
      setUserReaction(response.user_reaction);
      setReactionCounts(response.reaction_counts || {});
    } catch (error) {
      console.error("Reaction failed", error);
    }
  };

  const handleLikeToggle = async () => {
    const targetReaction = userReaction || "Like";
    await handleReact(targetReaction);
  };

  const handleTogglePrivacy = async () => {
    try {
      const newVisibility = visibility === "public" ? "private" : "public";
      await api.patch(`/posts/${post.id}/`, { visibility: newVisibility });
      setVisibility(newVisibility);
      setShowPrivacyConfirm(false);
      if (triggerToast) {
        triggerToast(`Post privacy changed to ${newVisibility === "public" ? "Public" : "Private"} successfully!`);
      }
    } catch (error) {
      console.error("Failed to toggle privacy", error);
      alert("Failed to change post privacy.");
    }
  };

  const getTopReactions = () => {
    return Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reaction]) => reaction);
  };

  const handleDeletePost = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeletePostConfirm = async () => {
    try {
      await api.delete(`/posts/${post.id}/`);
      setShowDeleteConfirm(false);
      if (triggerToast) {
        triggerToast("Your post has been deleted successfully!");
      }
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error("Delete post failed", error);
      alert("Failed to delete post.");
    }
  };

  const isAuthor = user?.id === post.author.id;
  const avatarUrl = post.author.avatar || "/assets/images/post_img.png";
  const initials = `${post.author.first_name?.[0] || ""}${post.author.last_name?.[0] || ""}`.toUpperCase() || "U";

  const formatPostTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      };
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = "numeric";
      }
      return date.toLocaleString([], options);
    }
  };

  const formattedTime = formatPostTime(post.created_at);

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm overflow-hidden">
      <CardContent className="p-4 md:p-5 space-y-4">


        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
              <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {post.author.full_name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{formattedTime}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  {visibility === "public" ? (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 text-sm">
                <Bookmark className="h-4 w-4 text-slate-500" />
                <span>Save Post</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 text-sm">
                <Bell className="h-4 w-4 text-slate-500" />
                <span>Notifications On</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 text-sm">
                <EyeOff className="h-4 w-4 text-slate-500" />
                <span>Hide Post</span>
              </DropdownMenuItem>

              {isAuthor && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/80" />
                  <DropdownMenuItem
                    onClick={() => setShowPrivacyConfirm(true)}
                    className="cursor-pointer flex items-center gap-2 p-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {visibility === "public" ? (
                      <>
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span>Make Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span>Make Public</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 text-sm text-blue-600 dark:text-blue-400">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Post</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 p-2 text-sm text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Post</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        {post.content && (
          <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}


        {post.image && (
          <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <img src={post.image} alt="Post Content" className="w-full max-h-[500px] object-cover" />
          </div>
        )}


        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div
            onClick={() => setLikersModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:underline hover:text-slate-700 dark:hover:text-slate-200"
          >

            <div className="flex -space-x-1">
              {getTopReactions().map((reaction) => (
                <span
                  key={reaction}
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${reactionDetails[reaction]?.bgClass} text-[9px] text-white ring-1 ring-white dark:ring-slate-900`}
                >
                  {reactionDetails[reaction]?.emoji}
                </span>
              ))}
            </div>
            <span>{likeCount} Reacts</span>
          </div>

          <div
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="cursor-pointer hover:underline hover:text-slate-700 dark:hover:text-slate-200"
          >
            {commentCount} Comments
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800/80" />


        <div className="grid grid-cols-3 gap-1">
          <div
            className="relative w-full"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >

            {showReactions && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-3 py-1.5">
                  {Object.entries(reactionDetails).map(([type, { emoji, label }]) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleReact(type);
                        setShowReactions(false);
                      }}
                      className="hover:scale-150 hover:-translate-y-1 transform transition-all duration-200 ease-out p-1 rounded-full text-base focus:outline-none origin-bottom"
                      title={label}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 w-full justify-center ${userReaction
                ? `${reactionDetails[userReaction]?.colorClass} font-semibold`
                : "text-slate-600 dark:text-slate-400"
                }`}
            >
              {userReaction ? (
                <span className="text-base leading-none">{reactionDetails[userReaction]?.emoji}</span>
              ) : (
                <Smile className="h-4 w-4" />
              )}
              <span>{userReaction ? reactionDetails[userReaction]?.label : "Like"}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setCommentsOpen(!commentsOpen)}
            className={`flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 ${commentsOpen ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400"}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>


        {commentsOpen && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <CommentSection
              postId={post.id}
              commentCount={commentCount}
              onCommentCountUpdated={setCommentCount}
            />
          </div>
        )}

      </CardContent>

      <LikersModal
        isOpen={likersModalOpen}
        onClose={() => setLikersModalOpen(false)}
        targetId={post.id}
        targetType="post"
      />

      <Dialog open={showPrivacyConfirm} onOpenChange={setShowPrivacyConfirm}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">Change Post Privacy</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Are you sure you want to change this post's privacy to{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {visibility === "public" ? "Private" : "Public"}
              </span>?
              {visibility === "public" ? (
                " Once private, only you will be able to see this post."
              ) : (
                " Once public, everyone will be able to see this post in their feed."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowPrivacyConfirm(false)}
              className="h-9 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border-none outline-none focus:outline-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTogglePrivacy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 border-none outline-none focus:outline-none"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">Delete Post</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-9 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border-none outline-none focus:outline-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePostConfirm}
              className="h-9 font-medium border-none outline-none focus:outline-none"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
