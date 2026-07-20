import type { Database } from "@/types/database";

export type AccountStatus = Database["public"]["Tables"]["profiles"]["Row"]["account_status"];

export const INACTIVE_ACCOUNT_STATUSES = new Set<AccountStatus>([
  "pending",
  "approved_pending_payment",
  "past_due",
  "blocked",
  "rejected",
  "cancelled"
]);

export function isOperationalAccountStatus(status: AccountStatus | null | undefined) {
  if (!status) {
    return false;
  }

  return !INACTIVE_ACCOUNT_STATUSES.has(status);
}

export function getAccountStatusLabel(status: AccountStatus | null | undefined) {
  switch (status) {
    case "pending":
      return "Pendiente de revision";
    case "approved_pending_payment":
      return "Aprobada, pendiente de pago";
    case "active":
      return "Activa";
    case "past_due":
      return "Pago vencido";
    case "blocked":
      return "Bloqueada";
    case "rejected":
      return "Rechazada";
    case "cancelled":
      return "Cancelada";
    default:
      return "Sin estado";
  }
}

export function getAccountStatusHelp(status: AccountStatus | null | undefined) {
  switch (status) {
    case "pending":
      return "Tu solicitud fue recibida. El equipo de AUTORA todavia debe revisarla.";
    case "approved_pending_payment":
      return "La cuenta ya fue aprobada. Falta registrar y confirmar la suscripcion para habilitar el panel.";
    case "active":
      return "La cuenta puede operar con normalidad en todos los modulos habilitados.";
    case "past_due":
      return "La suscripcion esta vencida. Necesitas registrar o confirmar el pago para volver a operar.";
    case "blocked":
      return "La cuenta fue bloqueada por administracion. Contacta soporte para revisar el caso.";
    case "rejected":
      return "La solicitud fue rechazada. Si crees que fue un error, puedes volver a contactar al equipo.";
    case "cancelled":
      return "La cuenta fue cancelada y no puede seguir operando.";
    default:
      return "Completa la activacion comercial para ingresar al panel.";
  }
}
