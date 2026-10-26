import { getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/layout/status-screen";

export default async function MarketingNotFound() {
  const t = await getTranslations("common");
  return (
    <StatusScreen
      eyebrow="404"
      title={t("missingTitle")}
      body={t("missingBody")}
      actionHref="/hacks"
      actionLabel={t("learn")}
      photo="window"
    />
  );
}
