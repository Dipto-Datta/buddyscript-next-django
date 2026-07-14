"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { User } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LikersModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: number;
  targetType: "post" | "comment";
}

export default function LikersModal({ isOpen, onClose, targetId, targetType }: LikersModalProps) {
  const [likers, setLikers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLikers = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = targetType === "post" 
          ? `/posts/${targetId}/likes/` 
          : `/comments/${targetId}/likes/`;
        
        const response = await api.get(endpoint);
        setLikers(response.results || []);
      } catch (err: any) {
        setError("Failed to load likes.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikers();
  }, [isOpen, targetId, targetType]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
            People who reacted
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 scrollbar-none">
          {loading && (
            <div className="text-center py-6 text-sm text-slate-500">
              Loading...
            </div>
          )}
          
          {error && (
            <div className="text-center py-6 text-sm text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && likers.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">
              No reactions yet.
            </div>
          )}

          {!loading && !error && likers.map((liker) => {
            const avatarUrl = liker.avatar || "/assets/images/profile.png";
            const initials = `${liker.first_name?.[0] || ""}${liker.last_name?.[0] || ""}`.toUpperCase() || "U";
            return (
              <div
                key={liker.id}
                className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-b-0"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-800">
                    <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {liker.reaction_type && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[10px] shadow-sm border border-slate-100 dark:border-slate-800">
                      {liker.reaction_type === "Like" ? "👍" :
                       liker.reaction_type === "Love" ? "❤️" :
                       liker.reaction_type === "Angry" ? "😡" :
                       liker.reaction_type === "Haha" ? "😆" : ""}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {liker.full_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {liker.email}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
