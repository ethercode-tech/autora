"use client";

import { useActionState } from "react";
import { createSubscription } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import type { AdminProfileRow, PlanRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type SubscriptionFormProps = {
  profiles: AdminProfileRow[];
  plans: PlanRow[];
};

export function SubscriptionForm({ profiles, plans }: SubscriptionFormProps) {
  const [state, action, pending] = useActionState(createSubscription, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="userId" required>
        <option disabled value="">
          Selecciona una cuenta
        </option>
        {profiles.map((profile) => (
          <option key={profile.user_id} value={profile.user_id}>
            {profile.business_name || profile.user_id}
          </option>
        ))}
      </select>
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="planId" required>
        <option disabled value="">
          Selecciona un plan
        </option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="pending" name="status" required>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="past_due">Past due</option>
        <option value="suspended">Suspended</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={new Date().toISOString().slice(0, 10)} name="startsAt" type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="endsAt" type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="nextBillingAt" type="date" />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear suscripcion"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
