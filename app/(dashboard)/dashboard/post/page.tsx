import { Plus } from "lucide-react";
import { SectionPlaceholder } from "../../../../src/components/dashboards/section-placeholder";

export default function PostPage() {
  return (
    <SectionPlaceholder
      description="Create and share verified ProofX updates from this workspace."
      icon={Plus}
      label="Dashboard / Post"
      title="Post"
    />
  );
}
