import { notFound } from "next/navigation";
import { WidgetGallery } from "@/components/chat/widget-gallery";

export default function DevWidgetsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <WidgetGallery />;
}
