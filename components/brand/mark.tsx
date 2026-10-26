import { cn } from "@/lib/utils";

export type MarkVariant = "light" | "dark" | "mono";

const palettes: Record<
  MarkVariant,
  { tile: string; ink: string; accent: string; glyph: string }
> = {
  light: { tile: "#FAF7F2", ink: "#16130F", accent: "#E4572E", glyph: "#1A120E" },
  dark: { tile: "#181512", ink: "#F5F0E8", accent: "#F26B43", glyph: "#1A120E" },
  mono: {
    tile: "transparent",
    ink: "currentColor",
    accent: "currentColor",
    glyph: "currentColor",
  },
};

type MarkProps = {
  variant?: MarkVariant;
  className?: string;
  title?: string;
};

/** Split-flap tile. The bottom half is the brand accent — the fare, flipped. */
export function Mark({ variant = "light", className, title = "Fareflip" }: MarkProps) {
  const color = palettes[variant];
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <rect
        x="2.5"
        y="3"
        width="27"
        height="12"
        rx="2.5"
        fill={color.tile}
        stroke={color.ink}
        strokeWidth="1.4"
      />
      <path
        d="M7 9.2h8.2"
        stroke={color.ink}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="2.5" y="17" width="27" height="12" rx="2.5" fill={color.accent} />
      <path
        d="M7 23.2h12"
        stroke={color.glyph}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity={variant === "mono" ? 0.0 : 1}
      />
      {variant === "mono" ? (
        <path
          d="M7 23.2h12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : null}
      <path d="M2.5 16.2h27" stroke={color.ink} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}
