import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const SUGGESTED_PEOPLE = [
  {
    name: "Steve Jobs",
    role: "CEO of Apple",
    avatar: "/assets/images/people1.png",
    fallback: "SJ",
  },
  {
    name: "Ryan Roslansky",
    role: "CEO of LinkedIn",
    avatar: "/assets/images/people2.png",
    fallback: "RR",
  },
  {
    name: "Dylan Field",
    role: "CEO of Figma",
    avatar: "/assets/images/chat1_img.png",
    fallback: "DF",
  },
];

export default function SuggestedPeople() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-left">Suggested People</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            See All
          </button>
        </div>

        <div className="space-y-3">
          {SUGGESTED_PEOPLE.map((person) => (
            <div key={person.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={person.avatar} style={{ objectFit: "cover" }} />
                  <AvatarFallback>{person.fallback}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h4 className="text-xs font-semibold">{person.name}</h4>
                  <p className="text-[10px] text-slate-400">{person.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2.5 rounded-lg">
                Connect
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
