import { FeatureHub } from "../../../../src/components/dashboards/feature-hub";
import { featureCatalog } from "../../../../src/lib/dashboard/feature-catalog";

export default function MessagesPage() {
  return <FeatureHub data={featureCatalog.messages} />;
}
