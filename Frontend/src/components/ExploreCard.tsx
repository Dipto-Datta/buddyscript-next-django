import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  BarChart2,
  UserPlus,
  Bookmark,
  Users,
  Gamepad2,
  Settings,
  Download,
} from "lucide-react";

const EXPLORE_ITEMS = [
  {
    name: "Learning",
    icon: PlayCircle,
    badge: "New",
  },
  {
    name: "Insights",
    icon: BarChart2,
  },
  {
    name: "Find friends",
    icon: UserPlus,
  },
  {
    name: "Bookmarks",
    icon: Bookmark,
  },
  {
    name: "Group",
    icon: Users,
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    badge: "New",
  },
  {
    name: "Settings",
    icon: Settings,
  },
  {
    name: "Save post",
    icon: Download,
  },
];

export default function ExploreCard() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-bold text-sm tracking-tight text-left">Explore</h3>
        <div className="space-y-1">
          {EXPLORE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-semibold">{item.name}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 font-bold rounded">
                    {item.badge}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
