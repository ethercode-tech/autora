"use client";

import { useActionState } from "react";
import { updateBusinessProfile } from "@/server/actions/catalog";
import type { ActionResult } from "@/server/actions/auth";
import type { ProfileRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type ProfileFormProps = {
  profile: ProfileRow | null;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateBusinessProfile, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <input
        className="rounded-2xl border border-autora-sand px-4 py-3"
        defaultValue={profile?.business_name ?? ""}
        name="businessName"
        placeholder="Nombre del emprendimiento"
        required
      />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={profile?.currency ?? "ARS"} maxLength={3} name="currency" placeholder="Moneda" required />
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={profile?.business_type ?? "manufacturer"} name="businessType" required>
        <option value="manufacturer">Fabrica</option>
        <option value="reseller">Revende</option>
      </select>
      <input
        className="rounded-2xl border border-autora-sand px-4 py-3"
        defaultValue={profile?.timezone ?? "America/Argentina/Buenos_Aires"}
        name="timezone"
        placeholder="Zona horaria"
        required
      />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Guardar configuracion"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
