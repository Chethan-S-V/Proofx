import { Bookmark } from "lucide-react";
import { Button } from "../../../components/ui/button";

type BookmarkButtonProps = {
  action: (formData: FormData) => Promise<void>;
  count: number;
  isBookmarked: boolean;
  repositoryId: string;
};

export function BookmarkButton({ action, count, isBookmarked, repositoryId }: BookmarkButtonProps) {
  return (
    <form action={action}>
      <input name="repositoryId" type="hidden" value={repositoryId} />
      <Button
        className={isBookmarked ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : ""}
        size="sm"
        type="submit"
        variant="outline"
      >
        <Bookmark className={isBookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        {count}
      </Button>
    </form>
  );
}
