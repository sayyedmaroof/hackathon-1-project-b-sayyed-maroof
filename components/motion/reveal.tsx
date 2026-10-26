import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/** Rises into place on load. Reduced motion shows the block immediately. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <div className={cn("rise-in", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
