import {
  ARTICLE_STATUS_VALUES,
  ARTICLE_MATERIAL_VALUES,
  type ArticleStatus,
  type ArticleMaterial,
  type KeycapProfileRef,
} from "@azertykeycaps-app/schemas";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/i18n";

interface ArticleFiltersProps {
  profiles: KeycapProfileRef[];
  selectedProfile?: string;
  selectedStatus?: ArticleStatus;
  selectedMaterial?: ArticleMaterial;
  onProfileChange: (value: string | undefined) => void;
  onStatusChange: (value: ArticleStatus | undefined) => void;
  onMaterialChange: (value: ArticleMaterial | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ArticleFilters({
  profiles,
  selectedProfile,
  selectedStatus,
  selectedMaterial,
  onProfileChange,
  onStatusChange,
  onMaterialChange,
  onClearFilters,
  hasActiveFilters,
}: ArticleFiltersProps) {
  const i18n = t();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Profile filter */}
      <Select value={selectedProfile ?? ""} onValueChange={(v) => onProfileChange(v || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue>
            {selectedProfile
              ? profiles.find((p) => p.slug === selectedProfile)?.title
              : i18n.articles.filters.profile}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{i18n.articles.filters.all}</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.slug}>
              {profile.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={selectedStatus ?? ""}
        onValueChange={(v) => onStatusChange((v as ArticleStatus) || undefined)}
      >
        <SelectTrigger className="w-40">
          <SelectValue>
            {selectedStatus ? i18n.status[selectedStatus] : i18n.articles.filters.status}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{i18n.articles.filters.all}</SelectItem>
          {ARTICLE_STATUS_VALUES.map((status) => (
            <SelectItem key={status} value={status}>
              {i18n.status[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Material filter */}
      <Select
        value={selectedMaterial ?? ""}
        onValueChange={(v) => onMaterialChange((v as ArticleMaterial) || undefined)}
      >
        <SelectTrigger className="w-40">
          <SelectValue>
            {selectedMaterial ? i18n.materials[selectedMaterial] : i18n.articles.filters.material}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{i18n.articles.filters.all}</SelectItem>
          {ARTICLE_MATERIAL_VALUES.map((material) => (
            <SelectItem key={material} value={material}>
              {i18n.materials[material]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters button - only visible when filters are active */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          {i18n.common.clearFilters}
        </Button>
      )}
    </div>
  );
}
