import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentForm } from "@/components/forms/payment-form";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: () => [{ success: false, message: "" }, "/admin/payment", false]
  };
});

vi.mock("@/server/actions/admin", () => ({
  createPayment: vi.fn()
}));

describe("PaymentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives the account user id from the selected subscription", () => {
    render(
      <PaymentForm
        subscriptions={[
          {
            id: "11111111-1111-1111-1111-111111111111",
            user_id: "22222222-2222-2222-2222-222222222222",
            status: "active",
            starts_at: "2026-07-20",
            next_billing_at: "2026-08-20",
            plans: { name: "Plan Base" }
          }
        ]}
      />
    );

    const subscriptionSelect = screen.getByRole("combobox", { name: "" });
    fireEvent.change(subscriptionSelect, { target: { value: "11111111-1111-1111-1111-111111111111" } });

    expect(screen.getByDisplayValue("22222222-2222-2222-2222-222222222222")).toBeDisabled();
    expect(screen.getByDisplayValue("22222222-2222-2222-2222-222222222222")).toHaveAttribute("readonly");
  });

  it("shows a safe placeholder until a subscription is selected", () => {
    render(<PaymentForm subscriptions={[]} />);

    expect(screen.getByDisplayValue("Se completa al elegir una suscripcion")).toBeDisabled();
  });
});
