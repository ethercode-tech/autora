import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/forms/password-reset-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Recuperacion</p>
        <h1 className="mt-2 text-3xl font-semibold">Recuperar acceso</h1>
        <p className="mt-2 text-sm leading-6 text-autora-ink/70">
          Enviaremos un enlace para que puedas redefinir la contrasena sin depender del equipo operativo.
        </p>
        <div className="mt-6">
          <PasswordResetRequestForm />
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
