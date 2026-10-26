export type ToolName =
  | "searchAwards"
  | "compareCashVsPoints"
  | "comparePlans"
  | "planEarning"
  | "findBoosters"
  | "getTransferSteps"
  | "buildStrategy"
  | "saveItinerary";

export type AgentEvent =
  | { type: "text-delta"; messageId: string; text: string }
  | { type: "tool-start"; messageId: string; toolId: string; tool: ToolName; label: string }
  | { type: "tool-end"; messageId: string; toolId: string; ok: boolean }
  | { type: "widget"; messageId: string; widget: import("@/lib/agent/widgets").WidgetPart }
  | { type: "suggestions"; messageId: string; items: string[] }
  | { type: "done"; messageId: string }
  | {
      type: "error";
      messageId: string;
      code: "rate_limit" | "usage_limit" | "unavailable";
      retryable: boolean;
    };

export type AgentMode = "plan" | "now";

export type AgentTurn = {
  role: "user" | "assistant";
  text: string;
};
