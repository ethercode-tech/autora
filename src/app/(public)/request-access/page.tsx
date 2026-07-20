import { Card } from "@/components/ui/card";
import { AccessRequestForm } from "@/components/forms/access-request-form";

export default function RequestAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Alta</p>
        <h1 className="mt-2 text-3xl font-semibold">Solicitá acceso</h1>
        <p className="mt-2 text-sm leading-6 text-autora-ink/70">
          Registramos tu solicitud para revisión manual. El acceso operativo no se activa hasta su aprobación.
        </p>
        <div className="mt-6">
          <AccessRequestForm />
        </div>
      </Card>
    </main>
  );
}
