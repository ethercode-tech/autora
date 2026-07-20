import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("@/server/actions/auth", () => ({
  signOut: vi.fn()
}));

describe("AppShell", () => {
  it("renders the operations navigation by default", () => {
    render(
      <AppShell>
        <div>contenido</div>
      </AppShell>
    );

    expect(screen.getByText("Panel operativo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Administracion" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compras" })).toBeInTheDocument();
  });

  it("renders an admin-only navigation when requested", () => {
    render(
      <AppShell mode="admin">
        <div>contenido</div>
      </AppShell>
    );

    expect(screen.getByText("Panel administrativo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Administracion" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Compras" })).not.toBeInTheDocument();
  });
});
