import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("rounded-xl2 border border-autora-sand bg-white p-6 shadow-panel", className)} {...props}>
      {children}
    </div>
  );
}
