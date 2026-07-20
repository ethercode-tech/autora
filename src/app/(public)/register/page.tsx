import { Card } from "@/components/ui/card";
import { ControlledSignupForm } from "@/components/forms/controlled-signup-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-autora-sage">Alta aprobada</p>
        <h1 className="mt-2 text-3xl font-semibold">Creá tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-autora-ink/70">
          Esta pantalla está pensada para solicitudes previamente aprobadas por administración. La cuenta nace en estado comercial controlado y queda lista para completar onboarding.
        </p>
        <div className="mt-6">
          <ControlledSignupForm />
        </div>
      </Card>
    </main>
  );
}
