import { Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";

type WatchButtonProps = {
  action: (formData: FormData) => Promise<void>;
  count: number;
  isWatching: boolean;
  repositoryId: string;
};

export function WatchButton({ action, count, isWatching, repositoryId }: WatchButtonProps) {
  return (
    <form action={action}>
      <input name="repositoryId" type="hidden" value={repositoryId} />
      <Button className={isWatching ? "border-blue-400/30 bg-blue-400/10 text-blue-100" : ""} size="sm" type="submit" variant="outline">
        <Eye className={isWatching ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        {count}
      </Button>
    </form>
  );
}
