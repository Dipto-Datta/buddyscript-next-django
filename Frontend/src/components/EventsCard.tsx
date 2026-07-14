import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const EVENTS = [
  {
    id: 1,
    day: "10",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
  },
  {
    id: 2,
    day: "15",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
  },
  {
    id: 3,
    day: "20",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
  },
  {
    id: 4,
    day: "25",
    month: "Jul",
    title: "No more terrorism no more cry",
    image: "/assets/images/feed_event1.png",
  },
];

export default function EventsCard() {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-left">Events</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            See All
          </button>
        </div>

        <div className="space-y-3">
          {EVENTS.map((event) => (
            <div key={event.id} className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
              <img src={event.image} alt="Event Graphic" className="w-full aspect-video object-cover" />
              <div className="p-3 flex gap-3 bg-slate-50 dark:bg-slate-950/30">
                <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded px-2.5 py-1">
                  <span className="text-sm font-bold leading-tight">{event.day}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">{event.month}</span>
                </div>
                <div className="text-left flex-1 flex items-center">
                  <h4 className="text-xs font-semibold line-clamp-2 text-slate-700 dark:text-slate-300">
                    {event.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
