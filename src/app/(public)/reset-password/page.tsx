import { Suspense } from "react";
import Link from "next/link";
import { PasswordRecoveryBridge } from "@/components/forms/password-recovery-bridge";
import { PasswordUpdateForm } from "@/components/forms/password-update-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Seguridad</p>
        <h1 className="mt-2 text-3xl font-semibold">Definir nueva contrasena</h1>
        <div className="mt-3">
          <Suspense fallback={<p className="text-sm text-autora-ink/70">Preparando validacion del enlace...</p>}>
            <PasswordRecoveryBridge />
          </Suspense>
        </div>
        <div className="mt-6">
          <PasswordUpdateForm submitLabel="Guardar nueva contrasena" />
        </div>
        <div className="mt-4">
          <Link href="/login">
            <Button className="w-full" variant="secondary">
              Volver al ingreso
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
