"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithPassword, type ActionResult } from "@/server/actions/auth";

const initialState: ActionResult = {
  success: false,
  message: ""
};

export function LoginForm() {
  const [state, action, pending] = useActionState(signInWithPassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Correo
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="email" name="email" required type="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Contrasena
        </label>
        <input className="w-full rounded-2xl border border-autora-sand px-4 py-3" id="password" name="password" required type="password" />
      </div>
      <div className="flex justify-end">
        <Link className="text-sm font-medium text-autora-burgundy" href="/forgot-password">
          Olvide mi contrasena
        </Link>
      </div>
      {state.message ? <p className="text-sm text-rose-700">{state.message}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
