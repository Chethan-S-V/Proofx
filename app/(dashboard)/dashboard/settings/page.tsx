import { redirect } from "next/navigation";
import { SettingsCenter } from "../../../../src/components/settings/settings-center";
import { getServerUser } from "../../../../src/lib/auth/service";
import { getDashboardSettings } from "../../../../src/lib/settings/service";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  const settings = getDashboardSettings(user);
  return <SettingsCenter email={settings.email} privateProfile={settings.privateProfile} recruiterVisible={settings.recruiterVisible} />;
}
