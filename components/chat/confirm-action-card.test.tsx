import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { ConfirmActionCard } from "@/components/chat/confirm-action-card";
import messages from "@/messages/es.json";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

function renderCard(props: Partial<ComponentProps<typeof ConfirmActionCard>> = {}) {
  const onConfirm = props.onConfirm ?? vi.fn();
  render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <ConfirmActionCard
        action="transfer"
        summary="Mover 45.000 Avios"
        amountLabel="45.000 Avios"
        reversible={false}
        availabilityShown={false}
        userConfirmed={false}
        onConfirm={onConfirm}
        {...props}
      />
    </NextIntlClientProvider>,
  );
  return onConfirm;
}

function confirmButton() {
  return screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
}

describe("ConfirmActionCard", () => {
  it("stays disabled until availability is shown and the person confirms", () => {
    renderCard();
    expect(confirmButton().disabled).toBe(true);
  });

  it("stays disabled until the irreversible checkbox is checked", () => {
    renderCard({ availabilityShown: true, userConfirmed: true });
    expect(confirmButton().disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Entiendo que esto no se puede deshacer" }));
    expect(confirmButton().disabled).toBe(false);
  });

  it("calls onConfirm once", () => {
    const onConfirm = renderCard({ availabilityShown: true, userConfirmed: true });
    fireEvent.click(screen.getByRole("checkbox", { name: "Entiendo que esto no se puede deshacer" }));
    fireEvent.click(confirmButton());
    fireEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("keeps a large points purchase disabled", () => {
    renderCard({ action: "buy", availabilityShown: true, userConfirmed: true, gapPoints: 45000 });
    fireEvent.click(screen.getByRole("checkbox", { name: "Entiendo que esto no se puede deshacer" }));
    expect(confirmButton().disabled).toBe(true);
  });
});
