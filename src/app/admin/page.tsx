import { AdminAccessRequestForm } from "@/components/forms/admin-access-request-form";
import { AdminAccountStatusForm } from "@/components/forms/admin-account-status-form";
import { PaymentForm } from "@/components/forms/payment-form";
import { PlanForm } from "@/components/forms/plan-form";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import {
  getAccessRequests,
  getAdminAuditLogs,
  getAdminDashboardMetrics,
  getAdminProfiles,
  getPayments,
  getPlans,
  getSubscriptions
} from "@/server/queries/catalog";

export default async function AdminPage() {
  const [metrics, accessRequests, profiles, plans, subscriptions, payments, auditLogs] = await Promise.all([
    getAdminDashboardMetrics(),
    getAccessRequests(),
    getAdminProfiles(),
    getPlans(),
    getSubscriptions(),
    getPayments(),
    getAdminAuditLogs()
  ]);

  const adminCards = [
    { label: "Solicitudes pendientes", value: metrics.pendingRequests },
    { label: "Cuentas activas", value: metrics.activeAccounts },
    { label: "Cuentas bloqueadas", value: metrics.blockedAccounts },
    { label: "Pagos registrados", value: metrics.registeredPayments },
    { label: "Suscripciones activas", value: metrics.activeSubscriptions }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Administracion"
        title="Panel interno"
        description="Area protegida para revisar solicitudes, cuentas, planes, suscripciones y pagos del negocio."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {adminCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-autora-ink/70">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Solicitudes de acceso</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Aprobacion o rechazo administrativo del pipeline de altas.</p>
          <div className="mt-4 space-y-4">
            {accessRequests.length > 0 ? accessRequests.map((request) => <AdminAccessRequestForm key={request.id} request={request} />) : <p className="text-sm text-autora-ink/70">No hay solicitudes cargadas.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Estado de cuentas</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Control operativo sobre bloqueo, activacion y estados comerciales.</p>
          <div className="mt-4 space-y-4">
            {profiles.length > 0 ? profiles.map((profile) => <AdminAccountStatusForm key={profile.user_id} profile={profile} />) : <p className="text-sm text-autora-ink/70">No hay cuentas disponibles.</p>}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold">Nuevo plan</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Define nombre, precio y periodo de facturacion del producto.</p>
          <div className="mt-4">
            <PlanForm />
          </div>
          {plans.length > 0 ? (
            <div className="mt-5 space-y-2">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl bg-autora-cream/60 px-4 py-3 text-sm">
                  {plan.name} · {Number(plan.price).toFixed(2)} {plan.currency} · {plan.billing_period}
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Nueva suscripcion</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Asigna plan y estado comercial a una cuenta existente.</p>
          <div className="mt-4">
            <SubscriptionForm plans={plans} profiles={profiles} />
          </div>
          {subscriptions.length > 0 ? (
            <div className="mt-5 space-y-2">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-2xl bg-autora-cream/60 px-4 py-3 text-sm">
                  {subscription.plans?.name || "Plan"} · {subscription.status} · {subscription.user_id}
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Nuevo pago</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Registro manual de pagos para el MVP comercial.</p>
          <div className="mt-4">
            <PaymentForm subscriptions={subscriptions} />
          </div>
          {payments.length > 0 ? (
            <div className="mt-5 space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl bg-autora-cream/60 px-4 py-3 text-sm">
                  {Number(payment.amount).toFixed(2)} {payment.currency} · {payment.status} · {payment.user_id}
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <h3 className="text-lg font-semibold">Auditoria reciente</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Registro base de acciones sensibles ejecutadas desde el panel interno.</p>
          {auditLogs.length > 0 ? (
            <div className="mt-4 space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl bg-autora-cream/60 px-4 py-3 text-sm">
                  {log.action} · {log.entity_type} · {log.entity_id || "sin id"} · {log.created_at}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-autora-ink/70">Todavia no hay eventos de auditoria registrados.</p>
          )}
        </Card>
      </section>
    </>
  );
}
