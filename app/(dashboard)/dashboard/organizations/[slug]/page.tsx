import { notFound, redirect } from "next/navigation";
import { OrganizationProfile } from "../../../../../src/features/organizations/components/organization-profile";
import { getOrganizationBySlug } from "../../../../../src/features/organizations/organization.service";
import { getServerUser } from "../../../../../src/lib/auth/service";

type OrganizationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;
  const data = await getOrganizationBySlug(slug, user.id);

  if (!data) {
    notFound();
  }

  return <OrganizationProfile data={data} />;
}
