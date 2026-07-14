"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { Post } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, Globe, Lock, Send, X, Video, Calendar, FileText, PenSquare, Pen } from "lucide-react";

interface PostCreateProps {
  onPostCreated: (post: Post) => void;
}

export default function PostCreate({ onPostCreated }: PostCreateProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const newPost = await api.post("/posts/", formData);
      onPostCreated(newPost);

      // Reset form
      setContent("");
      setVisibility("public");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = user?.avatar || "/assets/images/txt_img.png";
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "US";

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 md:p-5">
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800 flex-shrink-0">
              <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {user?.full_name || "User"}
                </span>

                <Select
                  value={visibility}
                  onValueChange={(val: "public" | "private") => setVisibility(val)}
                >
                  <SelectTrigger className="h-6 w-[95px] text-[10px] rounded-full border-slate-200 dark:border-slate-800 px-2 py-0 focus:ring-0 focus:ring-offset-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                    <SelectItem value="public" className="text-[11px] cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-slate-500" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private" className="text-[11px] cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-slate-500" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <span
                  className={`absolute left-0 top-0 text-sm text-slate-400 dark:text-slate-500 pointer-events-none transition-all duration-300 ease-out origin-top-left ${isFocused || content
                    ? "opacity-0 -translate-y-4 -translate-x-6 scale-75"
                    : "opacity-100 translate-y-0 translate-x-0"
                    }`}
                >
                  <div className="flex gap-2 items-center justify-between ">
                    <div>
                      Write something ...
                    </div>
                    <div>
                      <Pen className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </span>
                <Textarea
                  id="postContentInput"
                  className="w-full min-h-[60px] resize-none border-none bg-transparent p-0 text-slate-900 dark:text-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>
            </div>
          </div>


          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <img src={imagePreview} alt="Upload Preview" className="w-full max-h-[300px] object-contain mx-auto" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-80 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && (
            <div className="p-2.5 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          <div className="h-px bg-slate-100 dark:bg-slate-800/80" />


          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap items-center gap-1 md:gap-3">

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2.5 h-8 hover:bg-slate-105 dark:hover:bg-slate-800/40 rounded-lg"
              >
                <ImageIcon className="h-4 w-4 text-emerald-500" />
                <span>Photo</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2.5 h-8 hover:bg-slate-105 dark:hover:bg-slate-800/40 rounded-lg"
              >
                <Video className="h-4 w-4 text-indigo-500" />
                <span>Video</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2.5 h-8 hover:bg-slate-105 dark:hover:bg-slate-800/40 rounded-lg"
              >
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>Event</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2.5 h-8 hover:bg-slate-105 dark:hover:bg-slate-800/40 rounded-lg"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Article</span>
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading || (!content.trim() && !imageFile)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-sm rounded-lg px-4 h-8 text-xs"
              size="sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
