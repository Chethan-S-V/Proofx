import { GitFork } from "lucide-react";
import { Button } from "../../../components/ui/button";

type ForkButtonProps = {
  action: (formData: FormData) => Promise<void>;
  count: number;
  repositoryId: string;
};

export function ForkButton({ action, count, repositoryId }: ForkButtonProps) {
  return (
    <form action={action}>
      <input name="repositoryId" type="hidden" value={repositoryId} />
      <Button size="sm" type="submit" variant="outline">
        <GitFork className="h-4 w-4" aria-hidden="true" />
        {count}
      </Button>
    </form>
  );
}
