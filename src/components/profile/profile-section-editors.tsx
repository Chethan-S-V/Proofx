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
  "Accessibility",
  "Agile",
  "AI Engineering",
  "Android",
  "Angular",
  "API Design",
  "AWS",
  "Azure",
  "Bash",
  "C",
  "C#",
  "C++",
  "CI/CD",
  "Cloud Architecture",
  "CSS",
  "Cybersecurity",
  "Data Analysis",
  "Data Engineering",
  "Data Structures",
  "DevOps",
  "Docker",
  "Drizzle ORM",
  "Express.js",
  "Figma",
  "Firebase",
  "Flutter",
  "Frontend Architecture",
  "Git",
  "GitHub Actions",
  "Go",
  "Google Cloud",
  "GraphQL",
  "HTML",
  "iOS",
  "Java",
  "JavaScript",
  "Jest",
  "Kubernetes",
  "Laravel",
  "Linux",
  "Machine Learning",
  "Microservices",
  "MongoDB",
  "MySQL",
  "NestJS",
  "Next.js",
  "Node.js",
  "PHP",
  "Playwright",
  "PostgreSQL",
  "Prisma",
  "Python",
  "React",
  "React Native",
  "Redis",
  "REST APIs",
  "Ruby",
  "Rust",
  "Security Engineering",
  "Software Architecture",
  "Spring Boot",
  "SQL",
  "Supabase",
  "Svelte",
  "Swift",
  "Tailwind CSS",
  "Terraform",
  "Testing",
  "TypeScript",
  "UI Design",
  "UX Research",
  "Vue.js",
];

const majorSkillOptions = [
  "AI Engineer",
  "Android Developer",
  "Backend Developer",
  "Cloud Engineer",
  "Data Analyst",
  "Data Engineer",
  "DevOps Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "iOS Developer",
  "Machine Learning Engineer",
  "Mobile Developer",
  "Product Designer",
  "QA Engineer",
  "Security Engineer",
  "Software Developer",
  "Software Engineer",
  "UI/UX Designer",
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
  deleteAction: (formData: FormData) => Promise<void>;
  profile: DashboardProfile;
  type: "work" | "education" | "project";
};

export function SimpleProfileEditor({ action, deleteAction, profile, type }: SimpleProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const title = type === "work" ? "Edit experience" : type === "education" ? "Edit education" : "Edit projects";
  const addTitle = type === "work" ? "Add experience" : type === "education" ? "Add education" : "Add project";
  const collection = type === "work" ? "experience" : type === "education" ? "education" : "projects";
  const items = type === "work" ? profile.experience : type === "education" ? profile.education : profile.projects;

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      <EditorButton label={title} onClick={() => setOpen(true)} />
      {open ? (
        <Modal onClose={() => setOpen(false)} title={title}>
          {items.length > 0 ? (
            <div className="mb-4 space-y-2">
              {items.map((item) => {
                const itemTitle = "title" in item ? item.title : "school" in item ? item.school : item.name;
                const itemSubtitle = "company" in item ? item.company : "degree" in item ? item.degree : item.description;

                return (
                  <div className="flex items-center justify-between gap-3 rounded-md border border-slate-800 px-3 py-2" key={item.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{itemTitle}</p>
                      {itemSubtitle ? <p className="mt-1 truncate text-xs text-slate-500">{itemSubtitle}</p> : null}
                    </div>
                    <DeleteProfileItemButton action={deleteAction} collection={collection} id={item.id} label={`Delete ${itemTitle}`} mode="inline" />
                  </div>
                );
              })}
            </div>
          ) : null}
          <h3 className="mb-3 text-sm font-semibold text-slate-300">{addTitle}</h3>
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
  mode?: "absolute" | "inline";
};

export function DeleteProfileItemButton({ action, collection, id, label, mode = "absolute" }: DeleteProfileItemButtonProps) {
  return (
    <form action={action} className={mode === "absolute" ? "absolute right-2 top-2 opacity-0 transition group-hover/item:opacity-100" : "shrink-0"}>
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
  mode?: "hover" | "inline";
  remainingSkills: string[];
  skill: string;
};

export function DeleteSkillButton({ action, mode = "hover", remainingSkills, skill }: DeleteSkillButtonProps) {
  return (
    <form action={action} className={mode === "hover" ? "ml-1 inline-flex opacity-0 transition group-hover/skill:opacity-100" : "inline-flex"}>
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
  majorSkill: string | null;
  skills: string[];
};

export function SkillsEditor({ action, majorSkill, skills }: SkillsEditorProps) {
  const [open, setOpen] = useState(false);
  const [majorValue, setMajorValue] = useState(majorSkill ?? "");
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(skills);
  const trimmedQuery = query.trim();
  const filteredSkills =
    trimmedQuery.length > 0
      ? skillSuggestions
          .filter((skill) => skill.toLowerCase().includes(trimmedQuery.toLowerCase()))
          .filter((skill) => !selectedSkills.some((selectedSkill) => selectedSkill.toLowerCase() === skill.toLowerCase()))
          .slice(0, 8)
      : [];

  async function handleAction(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  function openEditor() {
    setMajorValue(majorSkill ?? "");
    setQuery("");
    setSelectedSkills(skills);
    setOpen(true);
  }

  function addSkill(skill: string) {
    const nextSkill = skill.trim();

    if (!nextSkill || selectedSkills.some((item) => item.toLowerCase() === nextSkill.toLowerCase())) {
      return;
    }

    setSelectedSkills([...selectedSkills, nextSkill].sort((first, second) => first.localeCompare(second)));
    setQuery("");
  }

  function removeSkill(skill: string) {
    const nextSkills = selectedSkills.filter((item) => item !== skill);

    setSelectedSkills(nextSkills);

    if (majorValue === skill) {
      setMajorValue("");
    }
  }

  return (
    <>
      <EditorButton label="Edit skills" onClick={openEditor} />
      {open ? (
        <Modal onClose={() => setOpen(false)} title="Edit skills">
          <form action={handleAction} className="space-y-4">
            <input name="skills" type="hidden" value={selectedSkills.join(", ")} />
            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Major</span>
              <select className={inputClass} name="majorSkill" onChange={(event) => setMajorValue(event.target.value)} value={majorValue}>
                <option value="">Select major skill</option>
                {majorSkillOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {selectedSkills
                  .filter((skill) => !majorSkillOptions.some((option) => option.toLowerCase() === skill.toLowerCase()))
                  .map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
              </select>
            </label>
            {selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300" key={skill}>
                    {skill}
                    <button
                      aria-label={`Delete ${skill}`}
                      className="inline-flex h-4 w-4 items-center justify-center rounded text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => removeSkill(skill)}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="space-y-2">
              <input className={inputClass} onChange={(event) => setQuery(event.target.value)} placeholder="Type a letter to search skills" value={query} />
              {filteredSkills.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredSkills.map((skill) => (
                    <button
                      className="rounded-md border border-slate-800 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                      key={skill}
                      onClick={() => addSkill(skill)}
                      type="button"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              ) : null}
              {trimmedQuery.length > 0 ? (
                <button
                  className="rounded-md border border-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                  onClick={() => addSkill(trimmedQuery)}
                  type="button"
                >
                  Add {trimmedQuery}
                </button>
              ) : null}
            </div>
            <Button type="submit">Save skills</Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
