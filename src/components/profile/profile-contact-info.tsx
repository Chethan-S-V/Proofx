"use client";

import { Copy, ExternalLink, Mail, Pencil, Phone, Share2, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DashboardProfile } from "../../lib/profile/service";
import { Button } from "../ui/button";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY } from "./profile-details-form";

const inputClass =
  "h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-slate-500";

const phoneVisibilityOptions = [
  { label: "Only me", value: "private" },
  { label: "Recruiters", value: "recruiters" },
  { label: "Connections", value: "connections" },
  { label: "Everyone", value: "public" },
] as const;

type ProfileContactInfoProps = {
  action: (formData: FormData) => Promise<void>;
  preferredCountryCode?: string;
  profile: DashboardProfile;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function getDefaultUsername(profile: DashboardProfile) {
  const base = (profile.username || profile.displayName || profile.email.split("@")[0] || "proofx_user")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return base.length >= 3 ? base : "proofx_user";
}

function getVisibilityLabel(value: DashboardProfile["phoneVisibility"]) {
  return phoneVisibilityOptions.find((option) => option.value === value)?.label ?? "Only me";
}

export function ProfileContactInfo({ action, preferredCountryCode, profile }: ProfileContactInfoProps) {
  const initialWebsites = profile.websites.length > 0 ? profile.websites : profile.website ? [profile.website] : [];
  const initialCountry =
    COUNTRY_OPTIONS.find((country) => country.phoneCode === preferredCountryCode) ??
    COUNTRY_OPTIONS.find((country) => country.phoneCode === profile.countryCode) ??
    COUNTRY_OPTIONS.find((country) => profile.phoneNumber?.startsWith(country.phoneCode)) ??
    DEFAULT_COUNTRY;
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [countryCode, setCountryCode] = useState(initialCountry.code);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber?.startsWith(initialCountry.phoneCode) ? profile.phoneNumber : initialCountry.phoneCode);
  const [phoneVisibility, setPhoneVisibility] = useState<DashboardProfile["phoneVisibility"]>(profile.phoneVisibility);
  const [username, setUsername] = useState(profile.username ?? getDefaultUsername(profile));
  const [websiteDraft, setWebsiteDraft] = useState("");
  const [websites, setWebsites] = useState(initialWebsites);
  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((country) => country.code === countryCode) ?? DEFAULT_COUNTRY,
    [countryCode],
  );

  useEffect(() => {
    const profileUsername = username.trim() || profile.username;
    setShareLink(profileUsername ? `${window.location.origin}/dashboard/profile?member=${encodeURIComponent(profileUsername)}` : "");
  }, [profile.username, username]);

  useEffect(() => {
    const nextCountry = COUNTRY_OPTIONS.find((country) => country.phoneCode === preferredCountryCode);

    if (!nextCountry) {
      return;
    }

    setCountryCode(nextCountry.code);
    setPhoneNumber((current) => (current.startsWith(nextCountry.phoneCode) ? current : nextCountry.phoneCode));
  }, [preferredCountryCode]);

  function closePanel() {
    setIsOpen(false);
    setIsEditing(false);
    setError("");
  }

  function handleCountryChange(nextCode: string) {
    const nextCountry = COUNTRY_OPTIONS.find((country) => country.code === nextCode) ?? DEFAULT_COUNTRY;
    setCountryCode(nextCountry.code);
    setPhoneNumber(nextCountry.phoneCode);
  }

  function handlePhoneChange(value: string) {
    const localDigits = digitsOnly(value.replace(selectedCountry.phoneCode, "")).slice(0, selectedCountry.phoneDigits);
    setPhoneNumber(`${selectedCountry.phoneCode}${localDigits}`);
  }

  async function handleSubmit(formData: FormData) {
    setError("");

    try {
      await action(formData);
      closePanel();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save contact info.");
    }
  }

  function addWebsite() {
    setError("");
    const nextWebsite = websiteDraft.trim();

    if (!nextWebsite) {
      return;
    }

    if (websites.length >= 8) {
      setError("You can add up to 8 websites.");
      return;
    }

    setWebsites((current) => [...current, nextWebsite]);
    setWebsiteDraft("");
  }

  function deleteWebsite(indexToDelete: number) {
    setWebsites((current) => current.filter((_, index) => index !== indexToDelete));
  }

  async function copyShareLink() {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(shareLink);
    } catch {
      setError("Copy was blocked by the browser. Select and copy the link manually.");
    }
  }

  const contactDialog = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onMouseDown={closePanel}>
      <div
        className="flex max-h-[86vh] w-full max-w-lg flex-col rounded-md border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Contact info"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Contact info</h2>
              <button
                aria-label="Edit contact info"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-900 hover:text-cyan-300"
                onClick={() => setIsEditing((current) => !current)}
                type="button"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">{profile.displayName}</p>
          </div>
          <button className="rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white" onClick={closePanel} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close contact info</span>
          </button>
        </div>

        <div className="mt-5 space-y-3 overflow-y-auto pr-1">
          <div className="flex gap-3 rounded-md border border-slate-800 p-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Email</p>
              <a className="break-all text-sm text-cyan-300 hover:text-cyan-100" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
          </div>

          <div className="flex gap-3 rounded-md border border-slate-800 p-3">
            <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">ProofX member share link</p>
              <p className="break-all text-sm text-slate-400">{shareLink || "Preparing link..."}</p>
            </div>
            <button className="self-start rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white" onClick={copyShareLink} type="button">
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Copy share link</span>
            </button>
          </div>

          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((website, index) => (
                <div className="flex gap-3 rounded-md border border-slate-800 p-3" key={`${website}-${index}`}>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Website</p>
                    <a className="mt-1 block break-all text-sm text-cyan-300 hover:text-cyan-100" href={website} rel="noreferrer" target="_blank">
                      {website}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-md border border-slate-800 p-3">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Phone</p>
                <p className="break-all text-sm text-slate-400">
                  {profile.phoneNumber ? `${profile.phoneNumber} (${getVisibilityLabel(profile.phoneVisibility)})` : "No phone number added."}
                </p>
              </div>
            </div>

            {isEditing ? (
              <form action={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[0.85fr_1.15fr]">
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>ProofX username</span>
                  <div className="flex rounded-md border border-slate-800 bg-slate-950 focus-within:border-cyan-400">
                    <span className="flex h-10 items-center border-r border-slate-800 px-3 text-sm text-slate-500">proofx/</span>
                    <input
                      className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600"
                      name="username"
                      onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      pattern="[a-z0-9_]{3,30}"
                      value={username}
                    />
                  </div>
                  <p className="text-xs text-slate-500">3-30 characters. Letters, numbers, and underscores only.</p>
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Country code</span>
                  <select className={inputClass} onChange={(event) => handleCountryChange(event.target.value)} value={countryCode}>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.phoneCode})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Phone number</span>
                  <div className="flex rounded-md border border-slate-800 bg-slate-950 focus-within:border-cyan-400">
                    <input
                      className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600"
                      inputMode="tel"
                      name="phoneNumber"
                      onChange={(event) => handlePhoneChange(event.target.value)}
                      value={phoneNumber}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedCountry.phoneDigits} digits after {selectedCountry.phoneCode}.
                  </p>
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>Phone visibility</span>
                  <select
                    className={inputClass}
                    name="phoneVisibility"
                    onChange={(event) => setPhoneVisibility(event.target.value as DashboardProfile["phoneVisibility"])}
                    value={phoneVisibility}
                  >
                    {phoneVisibilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>Add website</span>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      inputMode="url"
                      onChange={(event) => setWebsiteDraft(event.target.value)}
                      placeholder="https://portfolio.example"
                      value={websiteDraft}
                    />
                    <Button onClick={addWebsite} type="button">
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Add one website at a time.</p>
                </label>
                {websites.length > 0 ? (
                  <div className="space-y-2 sm:col-span-2">
                    {websites.map((website, index) => (
                      <div className="group/website flex items-center gap-2 rounded-md border border-slate-800 p-2" key={`${website}-${index}`}>
                        <a className="min-w-0 flex-1 break-all text-sm text-cyan-300 hover:text-cyan-100" href={website} rel="noreferrer" target="_blank">
                          {website}
                        </a>
                        <button
                          aria-label={`Delete website ${website}`}
                          className="rounded-md p-2 text-slate-500 opacity-0 transition hover:bg-red-950/40 hover:text-red-300 group-hover/website:opacity-100"
                          onClick={() => deleteWebsite(index)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <input name="countryCode" type="hidden" value={selectedCountry.phoneCode} />
                <input name="showPhone" type="hidden" value={phoneVisibility !== "private" ? "on" : ""} />
                <input name="websites" type="hidden" value={websites.join("\n")} />
                {error ? <p className="text-sm text-red-300 sm:col-span-2">{error}</p> : null}
                <div className="sm:col-span-2">
                  <Button type="submit">Save contact</Button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="text-sm font-medium text-cyan-300 transition hover:text-cyan-100" onClick={() => setIsOpen(true)} type="button">
        Contact info
      </button>

      {contactDialog ? createPortal(contactDialog, document.body) : null}
    </>
  );
}
