"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function Header({ title, showBack = false, actions }: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/10"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 -ml-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
