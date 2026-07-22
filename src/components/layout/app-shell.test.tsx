import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("@/server/actions/auth", () => ({
  signOut: vi.fn()
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/resources"
}));

describe("AppShell", () => {
  it("renders the operations navigation by default", () => {
    render(
      <AppShell businessName="Lumiq" businessType="manufacturer">
        <div>contenido</div>
      </AppShell>
    );

    expect(screen.getByText("autora")).toBeInTheDocument();
    expect(screen.getByText("Lumiq - Produzco")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Modulo 1 - Recursos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Modulo 2 - Compras/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mi stock actual/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Administracion" })).not.toBeInTheDocument();
  });

  it("renders an admin-only navigation when requested", () => {
    render(
      <AppShell businessName="Autora" mode="admin">
        <div>contenido</div>
      </AppShell>
    );

    expect(screen.getByText("Autora - Operacion interna")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Panel interno/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Modulo 2 - Compras/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Mi stock actual/i })).not.toBeInTheDocument();
  });
});
