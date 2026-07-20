import Link from "next/link";
import { ArrowRight, ChartColumn, Factory, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Inventario confiable",
    description: "Compras, producción y ventas actualizan stock con trazabilidad completa.",
    icon: Factory
  },
  {
    title: "Resultados claros",
    description: "Ingresos, egresos y alertas útiles para decidir sin planillas paralelas.",
    icon: ChartColumn
  },
  {
    title: "Acceso seguro",
    description: "Supabase Auth, RLS y separación real entre cuentas y administración.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-white/60 bg-white/80 px-6 py-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Autora</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight lg:text-6xl">
                Gestión cálida y seria para emprendimientos que producen o revenden.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-autora-ink/75">
                Una plataforma pensada para registrar compras, producir, vender, calcular costos y entender el resultado del negocio sin perder tiempo en planillas sueltas.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/request-access">
                <Button className="w-full sm:w-auto">
                  Solicitar acceso
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full sm:w-auto" variant="secondary">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <Icon className="h-6 w-6 text-autora-burgundy" />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-autora-ink/70">{description}</p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
