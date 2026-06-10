"use client";

import { Button } from "../ui/button";
import type { DashboardProfile } from "../../lib/profile/service";

const inputClass =
  "h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-slate-500";

type ProfileIntroFormProps = {
  action: (formData: FormData) => Promise<void>;
  profile: DashboardProfile;
};

export function ProfileIntroForm({ action, profile }: ProfileIntroFormProps) {
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="space-y-2">
        <span className={labelClass}>First name</span>
        <input className={inputClass} defaultValue={profile.firstName} name="firstName" required />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Last name</span>
        <input className={inputClass} defaultValue={profile.lastName} name="lastName" required />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className={labelClass}>Headline</span>
        <input className={inputClass} defaultValue={profile.headline ?? ""} name="headline" />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Phone number</span>
        <input className={inputClass} defaultValue={profile.phoneNumber ?? ""} name="phoneNumber" placeholder="+91..." />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Location</span>
        <input className={inputClass} defaultValue={profile.location ?? ""} name="location" />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Website</span>
        <input className={inputClass} defaultValue={profile.website ?? ""} name="website" type="url" />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input defaultChecked={profile.openToWork} name="openToWork" type="checkbox" />
        Open to work
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input defaultChecked={profile.showPhone} name="showPhone" type="checkbox" />
        Show phone on profile
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input defaultChecked={profile.showLocation} name="showLocation" type="checkbox" />
        Show location on profile
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">Save intro</Button>
      </div>
    </form>
  );
}
