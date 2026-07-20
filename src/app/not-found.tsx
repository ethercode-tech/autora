import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold">No encontramos esa página</h1>
        <p className="mt-3 text-sm leading-6 text-autora-ink/70">
          La ruta que buscás no existe o todavía no está conectada al módulo correspondiente.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
