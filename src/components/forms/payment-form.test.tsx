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
    const { container } = render(
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

    const subscriptionSelect = container.querySelector('select[name="subscriptionId"]');
    expect(subscriptionSelect).not.toBeNull();
    if (!subscriptionSelect) {
      throw new Error("subscription select not found");
    }
    fireEvent.change(subscriptionSelect, { target: { value: "11111111-1111-1111-1111-111111111111" } });

    const associatedAccountField = container.querySelector('input[placeholder="Cuenta asociada"]');
    expect(associatedAccountField).not.toBeNull();
    if (!associatedAccountField) {
      throw new Error("associated account field not found");
    }

    expect(associatedAccountField).toHaveValue("22222222-2222-2222-2222-222222222222");
    expect(associatedAccountField).toBeDisabled();
    expect(associatedAccountField).toHaveAttribute("readonly");
  });

  it("shows a safe placeholder until a subscription is selected", () => {
    render(<PaymentForm subscriptions={[]} />);

    expect(screen.getByDisplayValue("Se completa al elegir una suscripcion")).toBeDisabled();
  });
});
