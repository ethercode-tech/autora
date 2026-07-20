import Link from "next/link";
import type { PropsWithChildren } from "react";
import { LayoutDashboard, Package, Factory, ShoppingCart, BarChart3, Settings, Shield, Receipt, HandCoins, FlaskConical, ScissorsLineDashed, Calculator } from "lucide-react";
import { signOut } from "@/server/actions/auth";

const dashboardLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Recursos", icon: Package },
  { href: "/products", label: "Productos", icon: ShoppingCart },
  { href: "/recipes", label: "Recetas", icon: FlaskConical },
  { href: "/purchases", label: "Compras", icon: Receipt },
  { href: "/consumptions", label: "Consumos", icon: ScissorsLineDashed },
  { href: "/production", label: "Produccion", icon: Factory },
  { href: "/sales", label: "Ventas", icon: HandCoins },
  { href: "/results", label: "Resultados", icon: BarChart3 },
  { href: "/pricing", label: "Costos", icon: Calculator },
  { href: "/settings", label: "Configuracion", icon: Settings },
  { href: "/admin", label: "Administracion", icon: Shield }
] as const;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-autora-cream text-autora-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-autora-sand bg-white px-5 py-6 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Autora</p>
            <h1 className="mt-2 text-2xl font-semibold">Panel operativo</h1>
            <p className="mt-2 text-sm text-autora-ink/70">Gestion simple con inventario, costos y trazabilidad.</p>
          </div>

          <nav className="space-y-1">
            {dashboardLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-autora-ink transition-colors hover:bg-autora-sand/60"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <form action={signOut} className="mt-8">
            <button className="text-sm font-semibold text-autora-burgundy" type="submit">
              Cerrar sesion
            </button>
          </form>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
