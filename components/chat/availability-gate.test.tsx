import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { WidgetView } from "@/components/chat/widget-view";
import messages from "@/messages/es.json";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: { children?: unknown }) => props.children ?? null,
}));

describe("availability heatmap", () => {
  it("selects a date without confirming availability", () => {
    const onConfirmAvailability = vi.fn();
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <WidgetView
          widget={{
            type: "availability",
            optionId: "mad-jnb-iberia",
            month: "2027-01",
            cells: [{ date: "2027-01-20", cabin: "business", points: 85000 }],
          }}
          availabilityShown
          availabilityConfirmed={false}
          onConfirmAvailability={onConfirmAvailability}
          onPin={() => undefined}
        />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { pressed: false }));
    expect(onConfirmAvailability).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { pressed: true })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Confirmo que esta plaza sigue disponible" }));
    expect(onConfirmAvailability).toHaveBeenCalledTimes(1);
  });
});
