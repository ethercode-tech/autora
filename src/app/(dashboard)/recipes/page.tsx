import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { RecipeForm } from "@/components/forms/recipe-form";
import { PageHeader } from "@/components/layout/page-header";
import { getProducts, getProfileData, getRecipes, getResources } from "@/server/queries/catalog";

export default async function RecipesPage() {
  const [profile, products, resources, recipes] = await Promise.all([getProfileData(), getProducts(), getResources(), getRecipes()]);

  if (profile?.business_type === "reseller") {
    return (
      <>
        <PageHeader eyebrow="Catalogo" title="Recetas" description="Las recetas solo aplican a cuentas que fabrican productos." />
        <EmptyState title="Modulo no requerido para reventa" description="Las cuentas de reventa no necesitan recetas ni formula de produccion." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Catalogo"
        title="Recetas"
        description="Define formulas de produccion para convertir recursos en productos terminados con trazabilidad."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva receta</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Define rendimiento y todos los insumos necesarios en una sola receta para producir sin calculos manuales.</p>
        <div className="mt-4">
          {products.filter((product) => product.product_type === "manufactured").length > 0 && resources.length > 0 ? (
            <RecipeForm products={products} resources={resources} />
          ) : (
            <p className="text-sm text-amber-700">Necesitas al menos un producto fabricado y un recurso para crear recetas.</p>
          )}
        </div>
      </Card>
      {recipes.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{recipe.name}</h3>
                  <p className="text-sm text-autora-ink/70">Producto: {recipe.products?.name ?? "Sin producto"}</p>
                </div>
                <span className="rounded-full bg-autora-sand px-3 py-1 text-xs font-semibold">{recipe.active ? "Activa" : "Inactiva"}</span>
              </div>
              <p className="mt-3 text-sm">Rendimiento: {Number(recipe.yield_quantity).toFixed(3)}</p>
              <div className="mt-4 space-y-2">
                {recipe.recipe_items.map((item, index) => (
                  <div key={`${recipe.id}-${index}`} className="rounded-2xl bg-autora-cream/60 px-4 py-3 text-sm">
                    {item.resources?.name ?? "Recurso"}: {Number(item.quantity).toFixed(3)}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay recetas" description="Las recetas creadas aparecerán aquí para poder producir sin cálculos manuales." />
      )}
    </>
  );
}
