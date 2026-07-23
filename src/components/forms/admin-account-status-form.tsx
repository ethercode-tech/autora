"use client";

import { useActionState } from "react";
import { updateManualSubscriptionStatus, updateUserAccountStatus } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import type { AdminProfileRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type AdminAccountStatusFormProps = {
  profile: AdminProfileRow;
};

export function AdminAccountStatusForm({ profile }: AdminAccountStatusFormProps) {
  const [state, action, pending] = useActionState(updateUserAccountStatus, initialState);
  const [subscriptionState, subscriptionAction, subscriptionPending] = useActionState(updateManualSubscriptionStatus, initialState);

  return (
    <section className="grid gap-3 rounded-2xl bg-autora-cream/60 p-4">
      <div className="flex flex-col gap-1">
        <p className="font-medium">{profile.full_name || "Sin nombre"}</p>
        <p className="text-sm text-autora-ink/70">{profile.email || "Correo no disponible"}</p>
        <p className="text-sm text-autora-ink/70">{profile.business_name || "Sin nombre de emprendimiento"}</p>
        {profile.created_at ? <p className="text-xs text-autora-ink/60">Registro: {new Intl.DateTimeFormat("es-AR").format(new Date(profile.created_at))}</p> : null}
      </div>
      <form action={action} className="grid gap-2">
        <input name="userId" type="hidden" value={profile.user_id} />
        <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={profile.account_status} name="accountStatus">
          <option value="pending">Pendiente</option>
          <option value="approved_pending_payment">Aprobada, sin suscripción</option>
          <option value="active">Activa</option>
          <option value="blocked">Bloqueada</option>
          <option value="rejected">Rechazada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Actualizar cuenta"}
        </Button>
        {state.message ? <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p> : null}
      </form>
      <div className="border-t border-autora-sand pt-3">
        <p className="mb-2 text-sm text-autora-ink/70">
          Suscripción: <span className="font-medium">{profile.subscription_status === "active" ? "Activa" : "Inactiva"}</span>
        </p>
        <form action={subscriptionAction} className="flex gap-2">
          <input name="userId" type="hidden" value={profile.user_id} />
          <Button disabled={subscriptionPending} name="status" type="submit" value="active" variant="secondary">
            Activar suscripción
          </Button>
          <Button disabled={subscriptionPending} name="status" type="submit" value="cancelled" variant="secondary">
            Desactivar
          </Button>
        </form>
        {subscriptionState.message ? <p className={subscriptionState.success ? "mt-2 text-sm text-emerald-700" : "mt-2 text-sm text-rose-700"}>{subscriptionState.message}</p> : null}
      </div>
    </section>
  );
}
