"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PasswordRecoveryBridge() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Validando enlace de recuperacion...");
  const [tone, setTone] = useState<"neutral" | "success" | "error">("neutral");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || type !== "recovery") {
      setMessage("Ingresa desde el enlace que recibiste por correo para redefinir la contrasena.");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    void supabase.auth
      .verifyOtp({
        token_hash: tokenHash,
        type: "recovery"
      })
      .then(({ error }) => {
        if (error) {
          setTone("error");
          setMessage("El enlace no es valido o ya vencio. Solicita uno nuevo.");
          return;
        }

        setTone("success");
        setMessage("Enlace validado. Ya puedes definir una nueva contrasena.");
      });
  }, [searchParams]);

  return (
    <p className={tone === "error" ? "text-sm text-rose-700" : tone === "success" ? "text-sm text-emerald-700" : "text-sm text-autora-ink/70"}>
      {message}
    </p>
  );
}
