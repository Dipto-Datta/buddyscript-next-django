import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const EVENTS = [
  {
    id: 1,
    day: "10",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    goingCount: 17,
  },
  {
    id: 2,
    day: "15",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    goingCount: 23,
  },
  {
    id: 3,
    day: "20",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    goingCount: 12,
  },
  {
    id: 4,
    day: "25",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
    goingCount: 45,
  },
];

export default function EventsCard() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-left">Events</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            See all
          </button>
        </div>

        <div className="space-y-4">
          {EVENTS.map((event) => (
            <div key={event.id} className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm">
              <img src={event.image} alt="Event Graphic" className="w-full aspect-video object-cover" />
              
              <div className="p-3 flex gap-3 items-center">
                <div className="flex flex-col items-center justify-center bg-[#00c78b] text-white rounded-lg px-2 py-2 min-w-[46px] h-[46px] shrink-0">
                  <span className="text-sm font-extrabold leading-none">{event.day}</span>
                  <span className="text-[9px] uppercase font-extrabold leading-none mt-1">{event.month}</span>
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-xs font-bold line-clamp-2 text-slate-800 dark:text-slate-200 leading-tight">
                    {event.title}
                  </h4>
                </div>
              </div>

              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {event.goingCount} People Going
                </span>
                <button className="px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  Going
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
