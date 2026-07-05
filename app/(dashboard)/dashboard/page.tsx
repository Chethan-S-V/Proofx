import { redirect } from "next/navigation";
import { FeatureHub } from "../../../src/components/dashboards/feature-hub";
import { getServerUser } from "../../../src/lib/auth/service";
import { featureCatalog } from "../../../src/lib/dashboard/feature-catalog";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return <FeatureHub data={featureCatalog.workspace} />;
}
