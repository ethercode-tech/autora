import { EmptyState } from "@/components/feedback/empty-state";
import { PasswordUpdateForm } from "@/components/forms/password-update-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { UnitForm } from "@/components/forms/unit-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getMeasurementUnits, getProfileData } from "@/server/queries/catalog";

export default async function SettingsPage() {
  const [profile, units] = await Promise.all([getProfileData(), getMeasurementUnits()]);

  return (
    <>
      <PageHeader
        eyebrow="Cuenta"
        title="Configuracion"
        description="Nombre del emprendimiento, moneda, tipo de negocio, unidades, contrasena y estado comercial de la cuenta."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Emprendimiento</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Actualiza los datos base de tu cuenta operativa.</p>
          <div className="mt-4">
            <ProfileForm profile={profile} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Unidades de medida</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Define unidades reutilizables para recursos y compras.</p>
          <div className="mt-4">
            <UnitForm />
          </div>
          {units.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {units.map((unit) => (
                <span key={unit.id} className="rounded-full bg-autora-sand px-3 py-1 text-xs font-semibold">
                  {unit.name} ({unit.symbol})
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="Todavia no hay unidades" description="Crea al menos una unidad para habilitar el alta de recursos." />
            </div>
          )}
        </Card>
        <Card className="xl:col-span-2">
          <h3 className="text-lg font-semibold">Seguridad</h3>
          <p className="mt-1 text-sm text-autora-ink/70">Actualiza tu contrasena desde una sesion activa sin esperar un enlace por correo.</p>
          <div className="mt-4 max-w-xl">
            <PasswordUpdateForm />
          </div>
        </Card>
      </div>
    </>
  );
}
