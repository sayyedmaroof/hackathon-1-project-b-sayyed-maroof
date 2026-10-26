import { Container } from "@/components/layout/container";
import { WalletBridge } from "@/components/wallet/wallet-bridge";

export default function WalletPage() {
  return (
    <Container className="py-8">
      <WalletBridge />
    </Container>
  );
}
