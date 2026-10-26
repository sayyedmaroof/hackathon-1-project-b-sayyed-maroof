import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/layout/status-screen";

export default async function AppNotFound() {
  const t = await getTranslations("common");
  return (
    <StatusScreen
      eyebrow="404"
      title={t("missingTitle")}
      body={t("missingBody")}
      actionHref="/chat"
      actionLabel={t("chat")}
    />
  );
}
