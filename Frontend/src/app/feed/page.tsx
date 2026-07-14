"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { Post } from "../../types";
import Navbar from "../../components/Navbar";
import PostCreate from "../../components/PostCreate";
import PostCard from "../../components/PostCard";
import FloatingThemeToggle from "../../components/FloatingThemeToggle";
import SuggestedPeople from "../../components/SuggestedPeople";
import ExploreCard from "../../components/ExploreCard";
import EventsCard from "../../components/EventsCard";
import StoriesGrid from "../../components/StoriesGrid";
import YouMightLikeCard from "../../components/YouMightLikeCard";
import YourFriendsCard from "../../components/YourFriendsCard";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursorUrl, setNextCursorUrl] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const fetchPosts = useCallback(async (url: string = "/posts/") => {
    setLoadingPosts(true);
    setError(null);
    try {
      const response = await api.get(url);
      if (url === "/posts/") {
        setPosts(response.results || []);
      } else {
        setPosts((prev) => [...prev, ...(response.results || [])]);
      }
      setNextCursorUrl(response.next);
    } catch (err: any) {
      console.error("Fetch posts failed", err);
      setError("Failed to load feed posts. Please try again.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setToastMessage("Your post has been published successfully!");
    setShowToast(true);
  };

  const handlePostDeleted = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadMore = useCallback(() => {
    if (nextCursorUrl && !loadingPosts) {
      const urlObj = new URL(nextCursorUrl);
      let relativePath = urlObj.pathname + urlObj.search;
      if (relativePath.startsWith("/api/")) {
        relativePath = relativePath.slice(4);
      }
      fetchPosts(relativePath);
    }
  }, [nextCursorUrl, loadingPosts, fetchPosts]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingPosts) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextCursorUrl) {
          handleLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingPosts, nextCursorUrl, handleLoadMore]
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,
    overscan: 5,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading BuddyScript...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-hidden container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* left side */}
          <section className="hidden lg:block lg:col-span-3 space-y-6 h-full overflow-y-auto pr-2 scrollbar-none">

            <ExploreCard />

            <SuggestedPeople />

            <EventsCard />
          </section>

          {/* middle side */}
          <section ref={parentRef} className="col-span-1 lg:col-span-6 space-y-6 h-full overflow-y-auto px-2 pb-12 scrollbar-none">

            <StoriesGrid />


            <PostCreate onPostCreated={handlePostCreated} />

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}


            {posts.length === 0 && !loadingPosts ? (
              <Card className="border-slate-200 dark:border-slate-800 p-8 text-center bg-white/90 dark:bg-slate-900/90 shadow-sm">
                <h3 className="text-lg font-semibold mb-1">Your feed is empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a public or private post above to get started!
                </p>
              </Card>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const post = posts[virtualRow.index];
                  if (!post) return null;
                  return (
                    <div
                      key={virtualRow.key}
                      ref={rowVirtualizer.measureElement}
                      data-index={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: "24px",
                      }}
                    >
                      <PostCard
                        post={post}
                        onPostDeleted={handlePostDeleted}
                        triggerToast={(msg) => {
                          setToastMessage(msg);
                          setShowToast(true);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}


            {nextCursorUrl && (
              <div ref={lastPostElementRef} className="flex justify-center items-center py-6">
                {loadingPosts && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-semibold">Loading more posts...</span>
                  </div>
                )}
              </div>
            )}

            {loadingPosts && !nextCursorUrl && (
              <div className="text-center py-6 text-slate-400 animate-pulse text-sm">
                Loading posts...
              </div>
            )}
          </section>

          {/* right side */}
          <section className="hidden lg:block lg:col-span-3 space-y-6 h-full overflow-y-auto pl-2 scrollbar-none">

            <YouMightLikeCard />

            <YourFriendsCard />
          </section>

        </div>
      </main>
      {/* theme floating btn */}
      <FloatingThemeToggle />

      {/* toast msg */}
      <div className={`fixed bottom-6 right-6 z-55 transition-all duration-500 ease-out transform ${showToast
        ? "translate-y-0 opacity-100"
        : "translate-y-24 opacity-0 pointer-events-none"
        }`}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-sm transition-colors duration-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <p className="text-xs font-medium tracking-wide leading-relaxed">
            {toastMessage}
          </p>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors ml-2 focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
