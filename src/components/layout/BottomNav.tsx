"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Film,
  FolderOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueueStore } from "@/lib/stores";

const navItems = [
  { href: "/", icon: Sparkles, label: "Create" },
  { href: "/studio/t2i", icon: Image, label: "Image" },
  { href: "/studio/t2v", icon: Film, label: "Video" },
  { href: "/gallery", icon: FolderOpen, label: "Gallery" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const processingCount = useQueueStore((s) => s.getProcessingItems().length);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-t border-white/10"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] rounded-xl transition-colors relative",
                isActive
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 active:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <div className="relative">
                <Icon className="w-5 h-5 relative z-10" />
                {item.label === "Video" && processingCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center font-medium">
                    {processingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium relative z-10">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
