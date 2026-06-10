import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "../../../../src/components/dashboards/section-placeholder";

export default function AnalyticsPage() {
  return (
    <SectionPlaceholder
      description="Prepare the analytics route without adding analytics data, charts, or business logic."
      icon={BarChart3}
      label="Dashboard / Analytics"
      title="Analytics"
    />
  );
}
