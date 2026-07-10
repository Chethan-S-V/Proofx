import { Building2, ImagePlus, MapPin, Network, ShieldCheck, Sparkles } from "lucide-react";
import { createOrganizationAction } from "../organization.service";
import { organizationSizeOptions, organizationTypeLabels, organizationTypeValues } from "../organization.constants";

function Field({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-400">{title}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" {...props} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="mt-2 min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" {...props} />;
}

function Step({ children, icon: Icon, title }: { children: React.ReactNode; icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-white">
        <Icon className="h-4 w-4 text-cyan-300" />
        {title}
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function OrganizationCreateForm() {
  return (
    <form action={createOrganizationAction} className="space-y-5" encType="multipart/form-data">
      <Step icon={Building2} title="Basic Identity">
        <Field title="Organization name">
          <TextInput name="name" required maxLength={140} />
        </Field>
        <Field title="Organization type">
          <select className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="type" required defaultValue="company">
            {organizationTypeValues.map((value) => (
              <option key={value} value={value}>
                {organizationTypeLabels[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field title="Industry">
          <TextInput name="industry" maxLength={120} placeholder="Developer tools" />
        </Field>
        <Field title="Organization size">
          <select className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="size" defaultValue="">
            <option value="">Select size</option>
            {organizationSizeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <Field title="Founded year">
          <TextInput name="foundedYear" inputMode="numeric" placeholder="2026" />
        </Field>
        <Field title="Custom slug">
          <TextInput name="slug" placeholder="proofx-labs" />
        </Field>
      </Step>

      <Step icon={ImagePlus} title="Brand">
        <Field title="Logo image">
          <TextInput name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        </Field>
        <Field title="Cover image">
          <TextInput name="cover" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        </Field>
        <Field title="Tagline">
          <TextInput name="tagline" maxLength={180} />
        </Field>
        <Field title="Short description">
          <TextInput name="description" maxLength={4000} placeholder="What should the world know first?" />
        </Field>
      </Step>

      <Step icon={MapPin} title="Location">
        <Field title="Country">
          <TextInput name="country" maxLength={120} />
        </Field>
        <Field title="State or region">
          <TextInput name="state" maxLength={120} />
        </Field>
        <Field title="City">
          <TextInput name="city" maxLength={120} />
        </Field>
        <Field title="Postal code">
          <TextInput name="postalCode" maxLength={40} />
        </Field>
        <div className="md:col-span-2">
          <Field title="Headquarters">
            <TextInput name="headquarters" maxLength={180} placeholder="Bengaluru, Karnataka, India" />
          </Field>
        </div>
      </Step>

      <Step icon={Sparkles} title="Professional Identity">
        <Field title="Specialties">
          <TextArea name="specialties" placeholder="Proof verification, TypeScript, applied AI" />
        </Field>
        <Field title="Technologies">
          <TextArea name="technologies" placeholder="Next.js, PostgreSQL, Drizzle" />
        </Field>
        <Field title="Services">
          <TextArea name="services" placeholder="Audits, product engineering, verification programs" />
        </Field>
        <Field title="Professional categories">
          <TextArea name="professionalCategories" placeholder="Software, research, education" />
        </Field>
      </Step>

      <Step icon={Network} title="Online Presence">
        <Field title="Website">
          <TextInput name="website" type="url" placeholder="https://example.com" />
        </Field>
        <Field title="Public contact email">
          <TextInput name="primaryEmail" type="email" />
        </Field>
        <Field title="Phone">
          <TextInput name="phone" maxLength={40} />
        </Field>
        <label className="mt-8 flex items-center gap-2 text-sm text-slate-300">
          <input className="h-4 w-4 rounded border-slate-700 bg-slate-900" name="publicPhone" type="checkbox" />
          Show phone publicly
        </label>
        <div className="md:col-span-2">
          <Field title="Social links">
            <TextArea name="socialLinks" placeholder="GitHub: https://github.com/example" />
          </Field>
        </div>
      </Step>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-5">
        <p className="max-w-2xl text-sm leading-6 text-slate-400">Creates a draft organization, assigns you as owner, and opens onboarding so optional details can be finished later.</p>
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-semibold text-slate-950" type="submit">
          <ShieldCheck className="h-4 w-4" />
          Create organization
        </button>
      </div>
    </form>
  );
}
