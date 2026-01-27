import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div
      className="flex min-h-[60vh] flex-1 items-center justify-center px-4 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
