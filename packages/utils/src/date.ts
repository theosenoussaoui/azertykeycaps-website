import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(
  dateString: string | null | undefined,
): string | null {
  if (!dateString) return null;
  return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
}
