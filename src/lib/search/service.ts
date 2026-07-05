import { sql } from "drizzle-orm";
import { db, repositoriesTable, usersTable } from "../../db";

export type GlobalSearchResult = {
  description: string;
  href: string;
  id: string;
  kind: "person" | "proof" | "organization";
  title: string;
};

export type GlobalSearchResponse = {
  organizations: GlobalSearchResult[];
  people: GlobalSearchResult[];
  proofs: GlobalSearchResult[];
};

function getMetadataText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getDisplayName(metadata: Record<string, unknown>, email: string) {
  const firstName = getMetadataText(metadata.firstName);
  const lastName = getMetadataText(metadata.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const providerName = getMetadataText(metadata.full_name) || getMetadataText(metadata.name);

  return fullName || providerName || email.split("@")[0] || "ProofX user";
}

export async function searchGlobal(query: string, currentUserId: string): Promise<GlobalSearchResponse> {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return { organizations: [], people: [], proofs: [] };
  }

  const pattern = `%${normalizedQuery}%`;
  const [peopleRows, proofRows] = await Promise.all([
    db
      .select({
        email: usersTable.email,
        id: usersTable.id,
        metadata: usersTable.metadata,
      })
      .from(usersTable)
      .where(sql`
        ${usersTable.id} <> ${currentUserId}
        and
        lower(
          ${usersTable.email}
          || ' '
          || coalesce(${usersTable.metadata}->>'firstName', '')
          || ' '
          || coalesce(${usersTable.metadata}->>'lastName', '')
          || ' '
          || coalesce(${usersTable.metadata}->>'full_name', '')
          || ' '
          || coalesce(${usersTable.metadata}->>'name', '')
        ) like ${pattern}
      `)
      .limit(6),
    db
      .select({
        description: repositoriesTable.description,
        id: repositoriesTable.id,
        name: repositoriesTable.name,
        slug: repositoriesTable.slug,
      })
      .from(repositoriesTable)
      .where(sql`lower(${repositoriesTable.name} || ' ' || ${repositoriesTable.slug} || ' ' || coalesce(${repositoriesTable.description}, '')) like ${pattern}`)
      .limit(6),
  ]);

  return {
    organizations: [],
    people: peopleRows.map((person) => ({
      description: person.email,
      href: `/dashboard/profile/${person.id}`,
      id: person.id,
      kind: "person",
      title: getDisplayName(person.metadata, person.email),
    })),
    proofs: proofRows.map((proof) => ({
      description: proof.description ?? "Repository proof source",
      href: "/dashboard/repositories",
      id: proof.id,
      kind: "proof",
      title: proof.name,
    })),
  };
}
