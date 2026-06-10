import { Building2 } from "lucide-react";
import { SectionPlaceholder } from "../../../../src/components/dashboards/section-placeholder";

export default function OrganizationsPage() {
  return (
    <SectionPlaceholder
      description="Prepare the organization route without adding organization membership logic."
      icon={Building2}
      label="Dashboard / Organizations"
      title="Organizations"
    />
  );
}
