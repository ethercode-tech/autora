import { Card } from "@/components/ui/card";

export function ConfigurationState() {
  return (
    <Card className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Configuración pendiente</p>
      <h1 className="mt-2 text-3xl font-semibold">Faltan variables de entorno de Supabase</h1>
      <p className="mt-3 text-sm leading-6 text-autora-ink/70">
        La interfaz base está lista, pero para operar autenticación, persistencia y RLS necesitás completar `.env.local` a partir de `.env.example`.
      </p>
    </Card>
  );
}
