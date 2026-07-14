import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function YouMightLikeCard() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-left">You Might Like</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">See All</button>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/assets/images/people2.png" style={{ objectFit: "cover" }} />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
          <div className="text-left flex-1 min-w-0">
            <h4 className="text-xs font-semibold truncate">Radovan SkillArena</h4>
            <p className="text-[10px] text-slate-400 truncate">Founder & CEO at Trophy</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-slate-200 dark:border-slate-800 rounded-lg">
            Ignore
          </Button>
          <Button size="sm" className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Follow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
