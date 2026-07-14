import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FRIENDS = [
  {
    id: 1,
    name: "Steve Jobs",
    role: "CEO of Apple",
    avatar: "/assets/images/people1.png",
    fallback: "SJ",
    timeAgo: "5 minute ago",
    online: false,
  },
  {
    id: 2,
    name: "Ryan Roslansky",
    role: "CEO of LinkedIn",
    avatar: "/assets/images/people2.png",
    fallback: "RR",
    online: true,
  },
  {
    id: 3,
    name: "Dylan Field",
    role: "CEO of Figma",
    avatar: "/assets/images/chat1_img.png",
    fallback: "DF",
    online: true,
  },
  {
    id: 4,
    name: "Steve Jobs",
    role: "CEO of Apple",
    avatar: "/assets/images/people1.png",
    fallback: "SJ",
    timeAgo: "5 minute ago",
    online: false,
  },
  {
    id: 5,
    name: "Ryan Roslansky",
    role: "CEO of LinkedIn",
    avatar: "/assets/images/people2.png",
    fallback: "RR",
    online: true,
  },
  {
    id: 6,
    name: "Dylan Field",
    role: "CEO of Figma",
    avatar: "/assets/images/chat1_img.png",
    fallback: "DF",
    online: true,
  },
];

export default function YourFriendsCard() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-left">Your Friends</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">See All</button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Input search text"
            className="pl-8 h-8.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-lg"
          />
        </div>

        <div className="space-y-3">
          {FRIENDS.map((friend, index) => (
            <div
              key={`${friend.id}-${index}`}
              className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={friend.avatar} style={{ objectFit: "cover" }} />
                    <AvatarFallback>{friend.fallback}</AvatarFallback>
                  </Avatar>
                  {friend.online && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold">{friend.name}</h4>
                  <p className="text-[10px] text-slate-455 dark:text-slate-400">{friend.role}</p>
                </div>
              </div>
              {friend.timeAgo && (
                <span className="text-[9px] text-slate-455 dark:text-slate-400">{friend.timeAgo}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
