import { Card } from "@/components/ui/card";
import { ProductForm } from "@/components/forms/product-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { getProducts } from "@/server/queries/catalog";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Gestioná productos fabricados o de reventa, precios base y mínimos de stock."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo producto</h3>
        <p className="mt-1 text-sm text-autora-ink/70">El producto queda preparado para recetas, producción o ventas según su tipo.</p>
        <div className="mt-4">
          <ProductForm />
        </div>
      </Card>
      {products.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-autora-ink/70">{product.description || "Sin descripcion cargada."}</p>
                </div>
                <span className="rounded-full bg-autora-sand px-3 py-1 text-xs font-semibold">
                  {product.product_type === "manufactured" ? "Fabricado" : "Reventa"}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Unidad</dt>
                  <dd className="mt-1 text-sm">{product.sale_unit}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Precio base</dt>
                  <dd className="mt-1 text-sm">{product.default_sale_price ?? "No definido"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Stock minimo</dt>
                  <dd className="mt-1 text-sm">{product.minimum_stock ?? "No definido"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">SKU</dt>
                  <dd className="mt-1 text-sm">{product.sku || "No definido"}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay productos cargados"
          description="Cuando registres productos fabricados o de reventa, aparecerán aquí listos para operar sin depender de nombres como identificadores."
        />
      )}
    </>
  );
}
