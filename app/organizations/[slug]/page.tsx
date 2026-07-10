import { notFound } from "next/navigation";
import { PublicOrganizationProfile } from "../../../src/features/organizations/components/public-organization-profile";
import { getServerUser } from "../../../src/lib/auth/service";
import { getPublicOrganizationBySlug } from "../../../src/features/organizations/organization.service";

type PublicOrganizationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicOrganizationPage({ params }: PublicOrganizationPageProps) {
  const [{ slug }, user] = await Promise.all([params, getServerUser()]);
  const data = await getPublicOrganizationBySlug(slug, user?.id);

  if (!data) {
    notFound();
  }

  return <PublicOrganizationProfile canFollow={Boolean(user)} data={data} />;
}
