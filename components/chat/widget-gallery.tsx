"use client";

import { useState } from "react";
import { ConfirmActionCard } from "@/components/chat/confirm-action-card";
import { WidgetView } from "@/components/chat/widget-view";
import { jnbAwards, jnbStrategy } from "@/lib/agent/fixtures";
import type { WidgetPart } from "@/lib/agent/widgets";

const widgets: WidgetPart[] = [
  jnbStrategy,
  { type: "compare", options: jnbAwards },
  { type: "usage", used: 30, limit: 30, feature: "búsquedas" },
];

export function WidgetGallery() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="space-y-8 p-6">
      <h1 className="font-display text-4xl">Widgets</h1>
      {widgets.map((widget) => (
        <WidgetView
          key={widget.type}
          widget={widget}
          availabilityShown
          availabilityConfirmed={confirmed}
          onConfirmAvailability={() => setConfirmed(true)}
          onPin={() => undefined}
        />
      ))}
      <ConfirmActionCard
        action="transfer"
        summary="Mover 45.000 Avios"
        amountLabel="45.000 Avios"
        reversible={false}
        availabilityShown={false}
        userConfirmed={false}
        onConfirm={() => undefined}
      />
    </div>
  );
}
