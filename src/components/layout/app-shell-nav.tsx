"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type NavigationLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavigationSection = {
  title: string;
  links: readonly NavigationLink[];
};

type AppShellNavProps = {
  sections: readonly NavigationSection[];
};

export function AppShellNav({ sections }: AppShellNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-5 pb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-autora-sage/55">{section.title}</p>
          <div className="space-y-0.5">
            {section.links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 border-l-[3px] px-5 py-2.5 text-[15px] text-autora-ink/80 transition-colors",
                    isActive
                      ? "border-autora-burgundy bg-[#f5ecec] font-semibold text-autora-burgundy"
                      : "border-transparent hover:bg-[#f7f4ef] hover:text-autora-ink"
                  )}
                  href={href}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
