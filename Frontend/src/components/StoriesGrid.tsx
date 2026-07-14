import React from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useAuth } from "../lib/auth";

const STORIES = [
  {
    id: 1,
    name: "Ryan Roslansky",
    avatar: "/assets/images/people2.png",
    storyImage: "/assets/images/card_ppl2.png",
  },
  {
    id: 2,
    name: "Steve Jobs",
    avatar: "/assets/images/people1.png",
    storyImage: "/assets/images/people1.png",
  },
  {
    id: 3,
    name: "Dylan Field",
    avatar: "/assets/images/chat1_img.png",
    storyImage: "/assets/images/chat1_img.png",
  },
];

export default function StoriesGrid() {
  const { user } = useAuth();
  const yourAvatar = user?.avatar || "/assets/images/card_ppl1.png";

  return (
    <div className="relative group/stories">
      <div className="grid grid-cols-4 gap-3">

        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm group cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
          <img
            src={yourAvatar}
            alt="Your story"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 border border-white dark:border-slate-900 text-white p-1 rounded-full flex items-center justify-center h-6 w-6 shadow-md">
            <Plus className="h-3.5 w-3.5" />
          </div>

          <span className="absolute bottom-2.5 left-0 right-0 text-center text-[10px] font-bold text-white">
            Your Story
          </span>
        </div>


        {STORIES.map((story) => (
          <div
            key={story.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm group cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50"
          >
            <img
              src={story.storyImage}
              alt={`${story.name} story`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* User Profile Avatar Top Right */}
            <div className="absolute top-2 right-2 h-6 w-6 rounded-full border border-white dark:border-slate-900 overflow-hidden shadow-md">
              <img src={story.avatar} className="h-full w-full object-cover" alt={story.name} />
            </div>

            <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold text-white text-left line-clamp-1">
              {story.name}
            </span>
          </div>
        ))}
      </div>


      <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white h-6 w-6 rounded-full flex items-center justify-center shadow-lg cursor-pointer z-10 border border-white dark:border-slate-900">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}
