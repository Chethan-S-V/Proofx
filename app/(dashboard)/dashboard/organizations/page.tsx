import { redirect } from "next/navigation";
import { OrganizationDashboard } from "../../../../src/features/organizations/components/organization-dashboard";
import { getServerUser } from "../../../../src/lib/auth/service";
import { listOrganizationsForDashboard } from "../../../../src/features/organizations/organization.service";

export default async function OrganizationsPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const data = await listOrganizationsForDashboard(user.id);

  return <OrganizationDashboard data={data} />;
}
