"use client";

import { useActionState } from "react";
import { updateAccessRequestStatus } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import type { AccessRequestRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type AdminAccessRequestFormProps = {
  request: AccessRequestRow;
};

export function AdminAccessRequestForm({ request }: AdminAccessRequestFormProps) {
  const [state, action, pending] = useActionState(updateAccessRequestStatus, initialState);

  return (
    <form action={action} className="grid gap-2 rounded-2xl bg-autora-cream/60 p-4">
      <input name="requestId" type="hidden" value={request.id} />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{request.name}</p>
        <p className="text-sm text-autora-ink/70">{request.email} · {request.business_name}</p>
      </div>
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={request.status} name="status">
        <option value="pending">Pendiente</option>
        <option value="approved">Aprobada</option>
        <option value="rejected">Rechazada</option>
      </select>
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3" name="resolutionNotes" placeholder="Observacion interna" rows={2} />
      <Button disabled={pending} type="submit">
        {pending ? "Guardando..." : "Actualizar solicitud"}
      </Button>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p> : null}
    </form>
  );
}
