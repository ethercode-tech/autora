"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updatePassword, type ActionResult } from "@/server/actions/auth";

const initialState: ActionResult = {
  success: false,
  message: ""
};

type PasswordUpdateFormProps = {
  submitLabel?: string;
};

export function PasswordUpdateForm({ submitLabel = "Actualizar contrasena" }: PasswordUpdateFormProps) {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Nueva contrasena
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="password" name="password" required type="password" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="confirmPassword">
          Confirmacion
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="confirmPassword" name="confirmPassword" required type="password" />
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p> : null}
      <Button className="w-full sm:w-auto" disabled={pending} type="submit">
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
