import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.25em] text-autora-sage">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-autora-ink/70">{description}</p>
      </div>
      {actions}
    </div>
  );
}
