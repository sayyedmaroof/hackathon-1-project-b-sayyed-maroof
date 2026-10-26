import { describe, expect, it } from "vitest";
import { withoutLastAssistant } from "@/hooks/use-chat";
import type { StoredMessage } from "@/hooks/use-fare-store";

function message(id: string, role: StoredMessage["role"], text: string): StoredMessage {
  return { id, role, parts: [{ type: "text", text }], createdAt: "2026-10-26T00:00:00.000Z" };
}

describe("regenerate", () => {
  it("replaces the last assistant message instead of appending another", () => {
    const user = message("u1", "user", "Madrid to Johannesburg");
    const first = message("a1", "assistant", "First reply");
    const second = message("a2", "assistant", "Replacement");
    const next = [...withoutLastAssistant([user, first]), second];
    expect(next).toHaveLength(2);
    expect(next.filter((item) => item.role === "assistant")).toHaveLength(1);
    expect(next[1]?.id).toBe("a2");
  });
});
