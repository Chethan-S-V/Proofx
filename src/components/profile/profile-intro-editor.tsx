"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";
import type { DashboardProfile } from "../../lib/profile/service";
import { ProfileContactInfo } from "./profile-contact-info";
import { ProfileDetailsForm } from "./profile-details-form";

type ProfileIntroEditorProps = {
  action: (formData: FormData) => Promise<void>;
  contactAction: (formData: FormData) => Promise<void>;
  profile: DashboardProfile;
};

export function ProfileIntroEditor({ action, contactAction, profile }: ProfileIntroEditorProps) {
  const [open, setOpen] = useState(false);
  const [preferredCountryCode, setPreferredCountryCode] = useState(profile.countryCode ?? "+91");

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        aria-label="Edit profile intro"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-900 hover:text-cyan-300"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div
            aria-label="Edit profile intro"
            aria-modal="true"
            className="w-full max-w-2xl rounded-md border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Edit profile</h2>
                <p className="mt-1 text-sm text-slate-500">Name, headline, country, and location.</p>
              </div>
              <button className="rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white" onClick={() => setOpen(false)} type="button">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close editor</span>
              </button>
            </div>

            <div className="mt-5">
              <ProfileDetailsForm
                action={handleAction}
                afterLocation={
                  <div>
                    <ProfileContactInfo action={contactAction} preferredCountryCode={preferredCountryCode} profile={profile} />
                  </div>
                }
                onCountryPhoneCodeChange={setPreferredCountryCode}
                profile={profile}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
