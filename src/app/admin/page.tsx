import { AdminAccessRequestForm } from "@/components/forms/admin-access-request-form";
import { AdminAccountStatusForm } from "@/components/forms/admin-account-status-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAccessRequests, getAdminProfiles } from "@/server/queries/catalog";

export default async function AdminPage() {
  const [accessRequests, profiles] = await Promise.all([getAccessRequests(), getAdminProfiles()]);

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Cuentas AUTORA"
        description="Aprobá solicitudes y administrá el acceso y la suscripción de cada emprendimiento."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Solicitudes de acceso</h2>
          <p className="mt-1 text-sm text-autora-ink/70">Una solicitud aprobada puede crear su cuenta e iniciar sesión.</p>
          <div className="mt-4 space-y-4">
            {accessRequests.length > 0 ? (
              accessRequests.map((request) => <AdminAccessRequestForm key={request.id} request={request} />)
            ) : (
              <p className="text-sm text-autora-ink/70">No hay solicitudes cargadas.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Usuarios registrados</h2>
          <p className="mt-1 text-sm text-autora-ink/70">Nombre, correo, estado de cuenta y suscripción administrados manualmente.</p>
          <div className="mt-4 space-y-4">
            {profiles.length > 0 ? (
              profiles.map((profile) => <AdminAccountStatusForm key={profile.user_id} profile={profile} />)
            ) : (
              <p className="text-sm text-autora-ink/70">No hay cuentas disponibles.</p>
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
