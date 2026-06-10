"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { DashboardProfile } from "../../lib/profile/service";
import { Button } from "../ui/button";

const inputClass =
  "h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";
const textareaClass =
  "min-h-28 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";

const skillSuggestions = [
  "TypeScript",
  "Next.js",
  "React",
  "Node.js",
  "PostgreSQL",
  "Drizzle ORM",
  "Supabase",
  "Tailwind CSS",
  "Python",
  "Java",
  "Git",
  "Docker",
  "AWS",
  "UI Design",
  "Machine Learning",
  "Data Analysis",
];

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
};

type EditorButtonProps = {
  label: string;
  onClick: () => void;
};

function EditorButton({ label, onClick }: EditorButtonProps) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 opacity-0 transition hover:bg-slate-900 hover:text-cyan-300 group-hover:opacity-100"
      onClick={onClick}
      type="button"
    >
      <Pencil className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        aria-label={title}
        aria-modal="true"
        className="w-full max-w-xl rounded-md border border-slate-800 bg-slate-950 p-5 text-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white" onClick={onClose} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

type AboutEditorProps = {
  action: (formData: FormData) => Promise<void>;
  about: string | null;
};

export function AboutEditor({ about, action }: AboutEditorProps) {
  const [open, setOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      <EditorButton label="Edit about" onClick={() => setOpen(true)} />
      {open ? (
        <Modal onClose={() => setOpen(false)} title="Edit about">
          <form action={handleAction} className="space-y-3">
            <textarea className={textareaClass} defaultValue={about ?? ""} name="about" placeholder="A short note about what you build and what you can prove." />
            <Button type="submit">Save about</Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

type SimpleProfileEditorProps = {
  action: (formData: FormData) => Promise<void>;
  profile: DashboardProfile;
  type: "work" | "education" | "project";
};

export function SimpleProfileEditor({ action, profile, type }: SimpleProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const title = type === "work" ? "Add recent work" : type === "education" ? "Add education" : "Add project";

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      <EditorButton label={title} onClick={() => setOpen(true)} />
      {open ? (
        <Modal onClose={() => setOpen(false)} title={title}>
          {type === "work" ? (
            <form action={handleAction} className="grid gap-3 sm:grid-cols-2">
              <input className={inputClass} name="title" placeholder="Role title" required />
              <input className={inputClass} name="company" placeholder="Company" required />
              <input className={inputClass} defaultValue={profile.location ?? ""} name="location" placeholder="Location" />
              <input className={inputClass} name="startDate" placeholder="Start date" />
              <input className={inputClass} name="endDate" placeholder="End date" />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input name="current" type="checkbox" />
                Current role
              </label>
              <textarea className={`${textareaClass} sm:col-span-2`} name="description" placeholder="What did you build or prove?" />
              <div className="sm:col-span-2">
                <Button type="submit">Save work</Button>
              </div>
            </form>
          ) : null}
          {type === "education" ? (
            <form action={handleAction} className="grid gap-3 sm:grid-cols-2">
              <input className={inputClass} name="school" placeholder="School" required />
              <input className={inputClass} name="degree" placeholder="Degree" />
              <input className={inputClass} name="startDate" placeholder="Start date" />
              <input className={inputClass} name="endDate" placeholder="End date" />
              <div className="sm:col-span-2">
                <Button type="submit">Save education</Button>
              </div>
            </form>
          ) : null}
          {type === "project" ? (
            <form action={handleAction} className="space-y-3">
              <input className={inputClass} name="name" placeholder="Project name" required />
              <input className={inputClass} name="link" placeholder="Project link" />
              <textarea className={textareaClass} name="description" placeholder="What does it do?" />
              <Button type="submit">Save project</Button>
            </form>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}

type DeleteProfileItemButtonProps = {
  action: (formData: FormData) => Promise<void>;
  collection: "education" | "experience" | "projects";
  id: string;
  label: string;
};

export function DeleteProfileItemButton({ action, collection, id, label }: DeleteProfileItemButtonProps) {
  return (
    <form action={action} className="absolute right-2 top-2 opacity-0 transition group-hover/item:opacity-100">
      <input name="collection" type="hidden" value={collection} />
      <input name="id" type="hidden" value={id} />
      <button
        aria-label={label}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
        type="submit"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </form>
  );
}

type DeleteSkillButtonProps = {
  action: (formData: FormData) => Promise<void>;
  remainingSkills: string[];
  skill: string;
};

export function DeleteSkillButton({ action, remainingSkills, skill }: DeleteSkillButtonProps) {
  return (
    <form action={action} className="ml-1 inline-flex opacity-0 transition group-hover/skill:opacity-100">
      <input name="skills" type="hidden" value={remainingSkills.join(", ")} />
      <button
        aria-label={`Delete ${skill}`}
        className="inline-flex h-4 w-4 items-center justify-center rounded text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
        type="submit"
      >
        <Trash2 className="h-3 w-3" aria-hidden="true" />
      </button>
    </form>
  );
}

type SkillsEditorProps = {
  action: (formData: FormData) => Promise<void>;
  skills: string[];
};

export function SkillsEditor({ action, skills }: SkillsEditorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(skills.join(", "));

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  function addSkill(skill: string) {
    const currentSkills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (currentSkills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      return;
    }

    setValue([...currentSkills, skill].join(", "));
  }

  return (
    <>
      <EditorButton label="Edit skills" onClick={() => setOpen(true)} />
      {open ? (
        <Modal onClose={() => setOpen(false)} title="Edit skills">
          <form action={handleAction} className="space-y-4">
            <input className={inputClass} name="skills" onChange={(event) => setValue(event.target.value)} placeholder="TypeScript, Next.js, PostgreSQL" value={value} />
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.map((skill) => (
                <button
                  className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                  key={skill}
                  onClick={() => addSkill(skill)}
                  type="button"
                >
                  {skill}
                </button>
              ))}
            </div>
            <Button type="submit">Save skills</Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
