import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { WalletBoard } from "@/components/wallet/wallet-board";

export const metadata: Metadata = {
  title: "Miles and points",
  description: "Balances, what they are worth, and where they can transfer.",
};

export default function WalletPage() {
  return (
    <Container className="py-8 md:py-12">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">Wallet</p>
      <h1 className="mt-2 max-w-xl font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em]">
        Points, in plain money.
      </h1>
      <div className="mt-8">
        <WalletBoard />
      </div>
    </Container>
  );
}
