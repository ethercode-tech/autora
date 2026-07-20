import Link from "next/link";
import { getAccountStatusHelp, getAccountStatusLabel } from "@/lib/auth/account-status";
import { getProfileData } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AccountStatusPage() {
  const profile = await getProfileData();
  const accountStatus = profile?.account_status;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Estado de cuenta</p>
        <h1 className="mt-2 text-3xl font-semibold">Tu cuenta todavia no puede operar</h1>
        <p className="mt-3 text-sm leading-6 text-autora-ink/70">
          AUTORA exige aprobacion administrativa y estado comercial activo antes de ingresar al panel.
        </p>
        <div className="mt-6 rounded-3xl bg-autora-cream/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Estado actual</p>
          <p className="mt-2 text-lg font-semibold">{getAccountStatusLabel(accountStatus)}</p>
          <p className="mt-2 text-sm leading-6 text-autora-ink/70">{getAccountStatusHelp(accountStatus)}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
          <Link href="/request-access">
            <Button variant="secondary">Revisar alta</Button>
          </Link>
          <Link href="/forgot-password">
            <Button variant="secondary">Recuperar acceso</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
