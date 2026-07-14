"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { useTheme } from "next-themes";
import { api } from "../lib/api";
import { Notification } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Home,
  LogOut,
  HelpCircle,
  Settings,
  Search,
  MessageSquare,
  Users,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.get("/notifications/unread-count/");
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get("/notifications/");
      setNotifications(data.results || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkRead = async (notificationId: number, isRead: boolean) => {
    if (isRead) return;
    try {
      await api.post(`/notifications/${notificationId}/read/`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all/");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
  };

  const avatarUrl = user?.avatar || "/assets/images/profile.png";
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "US";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">


        <div className="flex-shrink-0 flex items-center gap-6">
          <Link href="/feed/" className="flex items-center">

            <img src="/assets/images/logo.svg" alt="BuddyScript" className="h-7 w-[150px]" />

          </Link>
        </div>


        <div className="hidden md:flex items-center justify-center flex-1 max-w-[360px] relative">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Input search text"
            className="pl-9 h-9 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>


        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-0">

            <Link href="/feed/" className="relative h-16 flex items-center px-4 group cursor-pointer select-none">
              <Home className="h-6 w-6 text-[#1890FF] dark:text-[#1890FF] group-hover:text-[#1890FF] dark:group-hover:text-white transition-colors duration-200" />
              <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#1890FF]" />
            </Link>


            <div className="relative h-16 flex items-center px-4 group cursor-pointer select-none">
              <Users className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-[#1890FF] dark:group-hover:text-white transition-colors duration-200" />
              <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#1890FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </div>


            <DropdownMenu onOpenChange={(open) => {
              if (open) {
                fetchNotifications();
                fetchUnreadCount();
              }
            }}>
              <DropdownMenuTrigger asChild>
                <div className="relative h-16 flex items-center px-4 group cursor-pointer select-none">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-[#1890FF] dark:group-hover:text-white transition-colors duration-200" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1890FF] text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-200">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#1890FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <span onClick={handleMarkAllRead} className="text-xs text-[#1890FF] cursor-pointer hover:underline select-none">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto scrollbar-none">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const sender = notification.sender;
                      const senderAvatar = sender?.avatar || "/assets/images/profile.png";
                      const initials = sender
                        ? `${sender.first_name?.[0] || ""}${sender.last_name?.[0] || ""}`.toUpperCase()
                        : "SYS";

                      const timeString = new Date(notification.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleMarkRead(notification.id, notification.is_read)}
                          className={`p-4 flex gap-3 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors ${notification.is_read
                              ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              : "bg-blue-50/40 dark:bg-[#1890FF]/5 hover:bg-blue-50/70 dark:hover:bg-[#1890FF]/10 font-medium"
                            }`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={senderAvatar} style={{ objectFit: "cover" }} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal break-words">
                              {notification.text}
                            </p>
                            <span className="text-[10px] text-slate-400 block">{timeString}</span>
                          </div>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-[#1890FF] self-center flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>


            <div className="relative h-16 flex items-center px-4 group cursor-pointer select-none">
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-[#1890FF] dark:group-hover:text-white transition-colors duration-200" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1890FF] text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  2
                </span>
              </div>
              <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#1890FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </div>
          </nav>


          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800" />


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 select-none">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800">
                  <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex items-center gap-1 text-left">
                  <p className="text-xs font-semibold max-w-[120px] truncate">{user?.full_name}</p>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/80" />

              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2.5">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">View Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2.5">
                <Settings className="h-4 w-4 text-slate-500" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2.5">
                <HelpCircle className="h-4 w-4 text-slate-500" />
                <span className="text-sm">Help & Support</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/80" />

              <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 flex items-center gap-2 p-2.5" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>


        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-slate-600 dark:text-slate-300"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="text-slate-600 dark:text-slate-300"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

      </div>


      {mobileSearchOpen && (
        <div className="md:hidden p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}


      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/feed/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users className="h-5 w-5" />
              <span>Friends</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 relative">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
              <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                2
              </span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
