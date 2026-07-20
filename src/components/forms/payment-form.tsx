"use client";

import { useActionState } from "react";
import { createPayment } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import type { SubscriptionRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type PaymentFormProps = {
  subscriptions: SubscriptionRow[];
};

export function PaymentForm({ subscriptions }: PaymentFormProps) {
  const [state, action, pending] = useActionState(createPayment, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="subscriptionId" required>
        <option disabled value="">
          Selecciona una suscripcion
        </option>
        {subscriptions.map((subscription) => (
          <option key={subscription.id} value={subscription.id}>
            {subscription.plans?.name || "Plan"} · {subscription.user_id}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="userId" placeholder="User ID de la cuenta" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="amount" placeholder="Importe" required step="0.01" type="number" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="ARS" maxLength={3} name="currency" placeholder="Moneda" required />
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="pending" name="status" required>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="rejected">Rejected</option>
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="paymentMethod" placeholder="Metodo de pago" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" name="externalReference" placeholder="Referencia externa" />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Registrar pago"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
