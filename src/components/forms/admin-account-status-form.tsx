"use client";

import { useActionState } from "react";
import { updateUserAccountStatus } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import type { AdminProfileRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type AdminAccountStatusFormProps = {
  profile: AdminProfileRow;
};

export function AdminAccountStatusForm({ profile }: AdminAccountStatusFormProps) {
  const [state, action, pending] = useActionState(updateUserAccountStatus, initialState);

  return (
    <form action={action} className="grid gap-2 rounded-2xl bg-autora-cream/60 p-4">
      <input name="userId" type="hidden" value={profile.user_id} />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{profile.business_name || "Sin nombre de emprendimiento"}</p>
        <p className="text-sm text-autora-ink/70">{profile.user_id}</p>
      </div>
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={profile.account_status} name="accountStatus">
        <option value="pending">Pending</option>
        <option value="approved_pending_payment">Approved pending payment</option>
        <option value="active">Active</option>
        <option value="past_due">Past due</option>
        <option value="blocked">Blocked</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <Button disabled={pending} type="submit">
        {pending ? "Guardando..." : "Actualizar cuenta"}
      </Button>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{state.message}</p> : null}
    </form>
  );
}
