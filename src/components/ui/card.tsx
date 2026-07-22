import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("rounded-[10px] border border-[#c8c2b8] bg-white p-6 shadow-none", className)} {...props}>
      {children}
    </div>
  );
}
