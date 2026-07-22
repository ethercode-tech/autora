import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-[#c8c2b8] pb-4 lg:mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? <p className="text-[11px] uppercase tracking-[0.22em] text-autora-sage/80">{eyebrow}</p> : null}
          <h2 className="mt-2 text-[29px] font-semibold leading-tight text-autora-burgundy">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-autora-ink/65">{description}</p>
        </div>
        {actions}
      </div>
    </div>
  );
}
