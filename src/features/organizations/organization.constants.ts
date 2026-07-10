export const organizationTypeValues = [
  "company",
  "startup",
  "university",
  "college",
  "school",
  "research_institution",
  "ngo",
  "nonprofit",
  "government_organization",
  "professional_association",
  "community",
  "open_source_organization",
  "hospital",
  "hotel",
  "restaurant",
  "agency",
  "studio",
  "production_house",
  "law_firm",
  "accounting_firm",
  "consultancy",
  "construction_company",
  "manufacturing_company",
  "sports_organization",
  "media_organization",
  "other",
] as const;

export type OrganizationType = (typeof organizationTypeValues)[number];

export const organizationTypeLabels: Record<OrganizationType, string> = {
  accounting_firm: "Accounting Firm",
  agency: "Agency",
  college: "College",
  community: "Community",
  company: "Company",
  consultancy: "Consultancy",
  construction_company: "Construction Company",
  government_organization: "Government Organization",
  hospital: "Hospital",
  hotel: "Hotel",
  law_firm: "Law Firm",
  manufacturing_company: "Manufacturing Company",
  media_organization: "Media Organization",
  ngo: "NGO",
  nonprofit: "Nonprofit",
  open_source_organization: "Open Source Organization",
  other: "Other",
  production_house: "Production House",
  professional_association: "Professional Association",
  research_institution: "Research Institution",
  restaurant: "Restaurant",
  school: "School",
  sports_organization: "Sports Organization",
  startup: "Startup",
  studio: "Studio",
  university: "University",
};

export const organizationSizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,001-5,000",
  "5,001-10,000",
  "10,001+",
] as const;

export const organizationVisibilityLabels = {
  active: "Active",
  archived: "Archived",
  draft: "Draft",
  suspended: "Suspended",
  under_review: "Under Review",
  verified: "Verified",
} as const;

export const organizationVerificationLabels = {
  document_pending: "Document Pending",
  domain_pending: "Domain Pending",
  email_pending: "Email Pending",
  manual_review: "Manual Review",
  not_started: "Unverified",
  rejected: "Rejected",
  verified: "Verified",
} as const;

export function getOrganizationTypeLabel(type: OrganizationType) {
  return organizationTypeLabels[type];
}
