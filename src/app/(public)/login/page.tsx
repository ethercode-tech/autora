import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Acceso</p>
        <h1 className="mt-2 text-3xl font-semibold">Ingresá a AUTORA</h1>
        <p className="mt-2 text-sm leading-6 text-autora-ink/70">
          Solo las cuentas aprobadas y activas pueden operar en la plataforma.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <div className="mt-4">
          <Link href="/register">
            <Button className="w-full" variant="secondary">
              Crear cuenta desde aprobación
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
