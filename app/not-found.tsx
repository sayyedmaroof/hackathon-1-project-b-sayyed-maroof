import { StatusScreen } from "@/components/layout/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="Esa tarjeta de embarque no está en este vuelo."
      body="La página no existe. El chat sigue donde lo dejaste."
      actionHref="/chat"
      actionLabel="Abrir el chat"
    />
  );
}
