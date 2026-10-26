import type { AgentEvent, AgentMode, AgentTurn, ToolName } from "@/lib/agent/events";
import {
  availabilityCells,
  balanceAwards,
  jnbAwards,
  jnbStrategy,
  nowAwards,
} from "@/lib/agent/fixtures";
import { usageLevel } from "@/lib/agent/gates";

type RunInput = {
  conversationId: string;
  messages: AgentTurn[];
  mode: AgentMode;
  locale: "es" | "en";
  usage?: { used: number; limit: number };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scenarioOf(text: string, history: string, mode: AgentMode, turns: number) {
  const value = `${history}\n${text}`.toLowerCase();
  const last = text.toLowerCase();
  if (last.includes("error") || last.includes("offline") || last.includes("sin conexión")) return "error";
  if (last.includes("límite") || last.includes("limite") || last.includes("limit")) return "usage";
  if (value.includes("revolut")) return "revolut";
  if (value.includes("40") && value.includes("avios")) return "balance";
  if (
    value.includes("sudáfrica") ||
    value.includes("sudafrica") ||
    value.includes("south africa") ||
    value.includes("johannes") ||
    value.includes("jnb") ||
    value.includes("90 días") ||
    value.includes("90 dias") ||
    value.includes("90 days")
  ) {
    return turns <= 1 ? "jnb-ask" : "jnb";
  }
  if (
    mode === "now" ||
    last.includes("ahora") ||
    last.includes("este finde") ||
    last.includes("mañana") ||
    last.includes("tomorrow") ||
    /\bnow\b/.test(last)
  ) {
    return "now";
  }
  return "fallback";
}

async function* tools(
  messageId: string,
  rows: { tool: ToolName; label: string }[],
): AsyncGenerator<AgentEvent> {
  for (const row of rows) {
    const toolId = `${row.tool}-${messageId}`;
    yield { type: "tool-start", messageId, toolId, tool: row.tool, label: row.label };
    await sleep(280);
    yield { type: "tool-end", messageId, toolId, ok: true };
  }
}

/** Scripted agent. Replace this function with a real stream later. */
export async function* runAgent(input: RunInput): AsyncIterable<AgentEvent> {
  const messageId = `m-${input.conversationId}-${input.messages.length}`;
  const users = input.messages.filter((message) => message.role === "user");
  const last = users.at(-1)?.text ?? "";
  const history = users.slice(0, -1).map((message) => message.text).join(" ");
  const kind = scenarioOf(last, history, input.mode, users.length);
  const en = input.locale === "en";

  if (input.usage && usageLevel(input.usage.used, input.usage.limit) === "blocked" && kind !== "usage") {
    yield {
      type: "widget",
      messageId,
      widget: { type: "usage", used: input.usage.used, limit: input.usage.limit, feature: en ? "searches" : "búsquedas" },
    };
    yield {
      type: "text-delta",
      messageId,
      text: en
        ? "You have used this month's searches. The conversation stays here."
        : "Has usado las búsquedas de este mes. La conversación sigue aquí.",
    };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "error") {
    yield {
      type: "error",
      messageId,
      code: "unavailable",
      retryable: true,
    };
    return;
  }

  if (kind === "usage") {
    yield {
      type: "widget",
      messageId,
      widget: { type: "usage", used: 30, limit: 30, feature: en ? "searches" : "búsquedas" },
    };
    yield { type: "suggestions", messageId, items: en ? ["See plans"] : ["Ver planes"] };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "jnb-ask") {
    const text = en
      ? "Business to South Africa in about 90 days. Do you leave from Madrid, and can the dates move a few days?"
      : "Business a Sudáfrica en unos 90 días. ¿Sales de Madrid y puedes mover las fechas unos días?";
    for (const chunk of text.split(" ")) {
      yield { type: "text-delta", messageId, text: `${chunk} ` };
      await sleep(28);
    }
    yield {
      type: "suggestions",
      messageId,
      items: en
        ? ["Yes, from Madrid, dates can move", "I need fixed dates"]
        : ["Sí, desde Madrid y puedo moverme", "Necesito fechas fijas"],
    };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "jnb") {
    yield* tools(messageId, [
      { tool: "buildStrategy", label: en ? "Writing the strategy" : "Preparando la estrategia" },
      { tool: "searchAwards", label: en ? "Checking 3 programs" : "Buscando disponibilidad en 3 programas" },
      { tool: "compareCashVsPoints", label: en ? "Comparing cash" : "Comparando con el efectivo" },
      { tool: "planEarning", label: en ? "Projecting points" : "Proyectando los puntos" },
    ]);
    yield { type: "widget", messageId, widget: jnbStrategy };
    yield { type: "widget", messageId, widget: { type: "compare", options: jnbAwards } };
    yield {
      type: "widget",
      messageId,
      widget: { type: "availability", optionId: jnbAwards[0]!.id, month: "2027-01", cells: availabilityCells(85000) },
    };
    yield {
      type: "widget",
      messageId,
      widget: {
        type: "earn",
        targetPoints: 85000,
        ownedPoints: 40000,
        monthlySpend: 1500,
        targetDate: "2027-01-20",
        extraSpend: false,
      },
    };
    yield {
      type: "widget",
      messageId,
      widget: {
        type: "confirm",
        action: "transfer",
        reversible: false,
        summary: en
          ? "Move Avios to Iberia for the Madrid–Johannesburg seat."
          : "Mover Avios a Iberia para la plaza Madrid–Johannesburgo.",
        amountLabel: "45.000 Avios",
      },
    };
    yield {
      type: "text-delta",
      messageId,
      text: en
        ? "The transfer stays locked until you confirm the seat is still there."
        : "La transferencia sigue bloqueada hasta que confirmes que la plaza sigue ahí.",
    };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "balance") {
    yield* tools(messageId, [
      { tool: "searchAwards", label: en ? "Matching your balance" : "Buscando canjes que encajan" },
    ]);
    yield { type: "widget", messageId, widget: { type: "compare", options: balanceAwards } };
    yield {
      type: "text-delta",
      messageId,
      text: en
        ? "Lisbon fits in 40,000 Avios. Rome in business is 12,000 short. Do not buy that gap yet."
        : "Lisboa cabe en 40.000 Avios. Roma en business se queda a 12.000. No compres ese hueco todavía.",
    };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "revolut") {
    yield* tools(messageId, [
      { tool: "comparePlans", label: en ? "Comparing Revolut plans" : "Comparando planes de Revolut" },
    ]);
    yield { type: "widget", messageId, widget: { type: "plans", spend: 1500 } };
    yield {
      type: "widget",
      messageId,
      widget: {
        type: "booster",
        merchant: "Tienda de ejemplo",
        multiplier: 20,
        spend: 100,
        expires: "2026-12-31",
        lastVerified: "2026-10-01",
      },
    };
    yield {
      type: "text-delta",
      messageId,
      text: en
        ? "At 1,500 € a month, none of these fees pay for themselves in points. Move the slider before you upgrade."
        : "Con 1.500 € al mes, ninguna cuota se paga solo con los puntos. Mueve el control antes de cambiar de plan.",
    };
    yield { type: "done", messageId };
    return;
  }

  if (kind === "now") {
    yield* tools(messageId, [
      { tool: "searchAwards", label: en ? "Checking seats this week" : "Mirando plazas de estos días" },
      { tool: "compareCashVsPoints", label: en ? "Cash versus points" : "Efectivo contra puntos" },
    ]);
    yield { type: "widget", messageId, widget: { type: "compare", options: nowAwards } };
    yield {
      type: "text-delta",
      messageId,
      text: en
        ? "Here cash wins. Keep the Avios for a cabin where the cash fare is actually high."
        : "Aquí compensa pagar en efectivo. Guarda los Avios para una cabina donde el billete de caja sea caro.",
    };
    yield { type: "done", messageId };
    return;
  }

  yield {
    type: "text-delta",
    messageId,
    text: en
      ? "This is a demo with sample data. Try the South Africa trip, a 40,000 Avios balance, or a Revolut question."
      : "Esto es una demo con datos de ejemplo. Prueba el viaje a Sudáfrica, un saldo de 40.000 Avios o una pregunta sobre Revolut.",
  };
  yield {
    type: "suggestions",
    messageId,
    items: en
      ? ["Business to South Africa in 90 days", "I have 40,000 Avios"]
      : ["Quiero volar en business a Sudáfrica en 90 días", "Tengo 40.000 Avios, ¿qué puedo canjear?"],
  };
  yield { type: "done", messageId };
}
