import { ShieldCheck } from "lucide-react";
import { SectionPlaceholder } from "../../../../src/components/dashboards/section-placeholder";

export default function ProofsPage() {
  return (
    <SectionPlaceholder
      description="Prepare the proofs route without adding proof engine or verification logic."
      icon={ShieldCheck}
      label="Dashboard / Proofs"
      title="Proofs"
    />
  );
}
