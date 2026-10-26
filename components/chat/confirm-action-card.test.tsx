import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { ConfirmActionCard } from "@/components/chat/confirm-action-card";
import messages from "@/messages/es.json";

function renderCard(props: Partial<ComponentProps<typeof ConfirmActionCard>> = {}) {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <ConfirmActionCard
        action="transfer"
        summary="Mover 45.000 Avios"
        amountLabel="45.000 Avios"
        reversible={false}
        availabilityShown={false}
        userConfirmed={false}
        {...props}
      />
    </NextIntlClientProvider>,
  );
}

function confirmButton() {
  return screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
}

describe("ConfirmActionCard", () => {
  it("stays disabled until availability is shown and the person confirms", () => {
    renderCard();
    expect(confirmButton().disabled).toBe(true);
  });

  it("enables a transfer once both conditions are true", () => {
    renderCard({ availabilityShown: true, userConfirmed: true });
    expect(confirmButton().disabled).toBe(false);
  });

  it("keeps a large points purchase disabled", () => {
    renderCard({ action: "buy", availabilityShown: true, userConfirmed: true, gapPoints: 45000 });
    expect(confirmButton().disabled).toBe(true);
  });
});
