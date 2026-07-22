import Link from "next/link";
import type { PropsWithChildren } from "react";
import { BarChart3, Calculator, Factory, HandCoins, Package, Receipt, Settings, Shield } from "lucide-react";
import { AppShellNav } from "@/components/layout/app-shell-nav";
import { signOut } from "@/server/actions/auth";

const operationsSections = [
  {
    title: "Modulos",
    links: [
      { href: "/resources", label: "Modulo 1 - Recursos", icon: Package },
      { href: "/purchases", label: "Modulo 2 - Compras", icon: Receipt },
      { href: "/production", label: "Modulo 3 - Produccion", icon: Factory },
      { href: "/pricing", label: "Modulo 4 - Precio", icon: Calculator },
      { href: "/sales", label: "Modulo 5 - Ventas", icon: HandCoins }
    ]
  },
  {
    title: "Resumen",
    links: [{ href: "/dashboard", label: "Mi stock actual", icon: BarChart3 }]
  }
] as const;

const adminSections = [{ title: "Administracion", links: [{ href: "/admin", label: "Panel interno", icon: Shield }] }] as const;

type AppShellProps = PropsWithChildren<{
  mode?: "operations" | "admin";
  businessName?: string | null;
  businessType?: "manufacturer" | "reseller" | null;
}>;

function formatBusinessTypeLabel(businessType: AppShellProps["businessType"], mode: AppShellProps["mode"]) {
  if (mode === "admin") {
    return "Operacion interna";
  }

  if (businessType === "reseller") {
    return "Revendo";
  }

  return "Produzco";
}

export function AppShell({ children, mode = "operations", businessName, businessType }: AppShellProps) {
  const navigationSections = mode === "admin" ? adminSections : operationsSections;
  const brandTitle = businessName?.trim() || (mode === "admin" ? "Autora" : "Mi negocio");
  const brandSubtitle = `${brandTitle} - ${formatBusinessTypeLabel(businessType, mode)}`;

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-autora-ink">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <aside className="flex flex-col border-b border-[#c8c2b8] bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-[#c8c2b8] px-5 py-5">
            <Link href={mode === "admin" ? "/admin" : "/dashboard"}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-autora-burgundy">Estudio Origen</p>
              <div className="mt-1 flex items-end gap-2">
                <h1 className="text-[22px] font-bold leading-none text-autora-burgundy">autora</h1>
                <span className="text-xs text-autora-ink/45">v8</span>
              </div>
              <p className="mt-2 text-sm text-autora-ink/60">{brandSubtitle}</p>
            </Link>
          </div>

          <div className="py-4">
            <AppShellNav sections={navigationSections} />
          </div>

          <div className="mt-auto border-t border-[#c8c2b8] px-5 py-4">
            {mode === "operations" ? (
              <div className="mb-2">
                <Link className="text-sm text-autora-ink/75 transition-colors hover:text-autora-burgundy" href="/settings">
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuracion
                  </span>
                </Link>
              </div>
            ) : null}
            <form action={signOut}>
              <button className="text-sm font-semibold text-autora-burgundy" type="submit">
                Cerrar sesion
              </button>
            </form>
          </div>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
