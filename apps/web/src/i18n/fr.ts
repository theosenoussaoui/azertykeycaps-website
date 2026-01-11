export const fr = {
  common: {
    new: "Nouveau",
    loading: "Chargement...",
    error: "Erreur",
    noResults: "Aucun résultat",
    previous: "Précédent",
    next: "Suivant",
    back: "Retour",
    clearFilters: "Effacer les filtres",
  },
  articles: {
    title: "Articles",
    filters: {
      all: "Tous",
      profile: "Profil",
      status: "Statut",
      material: "Matériau",
    },
    viewArticle: "Voir l'article",
    affiliateLink: "Lien affilié",
    additionalLink: "Lien additionnel",
    startDate: "Début",
    endDate: "Fin",
  },
  status: {
    in_stock: "En stock",
    extras_gb: "Extras GB",
    extras_in_stock: "Extras en stock",
    gb_running: "GB en cours",
    gb_ended: "GB terminé",
    interest_check: "Interest Check",
    out_of_stock: "Rupture",
  },
  materials: {
    abs_double_shot: "ABS Double-shot",
    abs_pad_printed: "ABS Pad-printed",
    abs_simple: "ABS Simple",
    aluminium: "Aluminium",
    pbt_double_shot: "PBT Double-shot",
    pbt_dye_sub: "PBT Dye-sub",
    pbt_laser_printed: "PBT Laser-printed",
  },
} as const;

export type Translations = typeof fr;
