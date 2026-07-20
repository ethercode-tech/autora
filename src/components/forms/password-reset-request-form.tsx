"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type ActionResult } from "@/server/actions/auth";

const initialState: ActionResult = {
  success: false,
  message: ""
};

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Correo
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="email" name="email" required type="email" />
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Enviando..." : "Enviar enlace de recuperacion"}
      </Button>
    </form>
  );
}
