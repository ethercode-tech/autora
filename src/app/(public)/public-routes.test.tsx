import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfigurationState } from "@/components/feedback/configuration-state";
import ForgotPasswordPage from "@/app/(public)/forgot-password/page";
import HomePage from "@/app/(public)/page";
import LoginPage from "@/app/(public)/login/page";
import ResetPasswordPage from "@/app/(public)/reset-password/page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}));

vi.mock("@/components/forms/login-form", () => ({
  LoginForm: () => <form aria-label="login-form" />
}));

vi.mock("@/components/forms/password-reset-request-form", () => ({
  PasswordResetRequestForm: () => <form aria-label="password-reset-request-form" />
}));

vi.mock("@/components/forms/password-recovery-bridge", () => ({
  PasswordRecoveryBridge: () => <p>Ingresa desde el enlace que recibiste por correo para redefinir la contrasena.</p>
}));

vi.mock("@/components/forms/password-update-form", () => ({
  PasswordUpdateForm: ({ submitLabel }: { submitLabel?: string }) => <form aria-label={submitLabel ?? "password-update-form"} />
}));

describe("public route rendering", () => {
  it("renders the landing page with the main entry points", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /emprendimientos que producen o revenden/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /solicitar acceso/i })).toHaveAttribute("href", "/request-access");
    expect(screen.getByRole("link", { name: /iniciar sesi|iniciar sesion/i })).toHaveAttribute("href", "/login");
  });

  it("renders the login page with access and signup actions", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /autora/i })).toBeInTheDocument();
    expect(screen.getByLabelText("login-form")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear cuenta desde aprobaci/i })).toHaveAttribute("href", "/register");
  });

  it("renders the forgot-password and reset-password flows", () => {
    const { rerender } = render(<ForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: /recuperar acceso/i })).toBeInTheDocument();
    expect(screen.getByLabelText("password-reset-request-form")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al ingreso/i })).toHaveAttribute("href", "/login");

    rerender(<ResetPasswordPage />);

    expect(screen.getByRole("heading", { name: /definir nueva contrasena/i })).toBeInTheDocument();
    expect(screen.getByText(/ingresa desde el enlace que recibiste por correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Guardar nueva contrasena")).toBeInTheDocument();
  });

  it("renders the configuration guidance fallback", () => {
    render(<ConfigurationState />);

    expect(screen.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeInTheDocument();
    expect(screen.getByText(/\.env\.local/i)).toBeInTheDocument();
  });
});
