"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function FloatingThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed right-[-17px] top-1/2 -translate-y-1/2 z-50 hidden md:block mr-0">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative bg-blue-600 border border-blue-600 rounded-full w-[66px] h-[32px] flex items-center justify-between px-2 cursor-pointer rotate-90 transform outline-none shadow-lg focus:outline-none transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle Mode"
      >

        <div
          className={`absolute h-[18px] w-[18px] rounded-full bg-white transition-transform duration-300 shadow-md transform left-[8px] ${isDark ? "translate-x-[30px]" : "translate-x-0"
            }`}
        />


        <div className="-rotate-90 text-white z-10 pl-0.5">
          <Sun className="h-3.5 w-3.5 fill-current" />
        </div>


        <div className="-rotate-90 text-white z-10 pr-0.5">
          <Moon className="h-3.5 w-3.5 fill-current" />
        </div>
      </button>
    </div>
  );
}
