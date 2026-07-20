import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-autora-sand text-autora-ink",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700"
};

export function Badge({ className, children, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
