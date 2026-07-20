"use client";

import { useActionState } from "react";
import { registerApprovedAccount, type ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = {
  success: false,
  message: ""
};

export function ControlledSignupForm() {
  const [state, action, pending] = useActionState(registerApprovedAccount, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Correo aprobado
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="email" name="email" required type="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="password" name="password" required type="password" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="confirmPassword">
          Repetí la contraseña
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="confirmPassword" name="confirmPassword" required type="password" />
      </div>
      {state.message ? (
        <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
