import { Star } from "lucide-react";
import { Button } from "../../../components/ui/button";

type StarButtonProps = {
  action: (formData: FormData) => Promise<void>;
  count: number;
  isStarred: boolean;
  repositoryId: string;
};

export function StarButton({ action, count, isStarred, repositoryId }: StarButtonProps) {
  return (
    <form action={action}>
      <input name="repositoryId" type="hidden" value={repositoryId} />
      <Button
        className={isStarred ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : ""}
        size="sm"
        type="submit"
        variant="outline"
      >
        <Star className={isStarred ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        {count}
      </Button>
    </form>
  );
}
