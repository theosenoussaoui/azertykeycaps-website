export const fr = {
  common: {
    new: "Nouveau",
    loading: "Chargement...",
    error: "Erreur",
    noResults: "Aucun résultat",
    previous: "Précédent",
    next: "Suivant",
    back: "Retour",
    backHome: "Retour à l'accueil",
    clearFilters: "Effacer les filtres",
    retry: "Réessayer",
  },
  errors: {
    generic: "Une erreur est survenue",
    loadingFailed: "Impossible de charger les données",
    tryAgain: "Veuillez réessayer",
  },
  nav: {
    home: "Accueil",
    about: "Informations",
    suggest: "Suggérer",
    profiles: "Profils",
    profileShapes: {
      sculpted: "Sculptés",
      uniform: "Uniformes",
    },
  },
  footer: {
    builtBy: "Construit par",
  },
  home: {
    title: "Azertykeycaps",
    subtitle: "Découvrez les keysets compatibles AZERTY",
    latestArticles: "Derniers ajouts",
    browseByProfile: "Parcourir par profil",
    metaTitle: "Azertykeycaps - Keysets AZERTY",
    metaDescription:
      "Découvrez notre sélection de keysets compatibles AZERTY. Filtrez par profil, statut et matériau.",
  },
  articles: {
    title: "Articles",
    metaTitle: "Azertykeycaps - Keysets AZERTY",
    metaDescription:
      "Découvrez notre sélection de keysets compatibles AZERTY. Filtrez par profil, statut et matériau.",
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
  pages: {
    about: {
      title: "Informations",
      metaTitle: "Azertykeycaps - Informations",
      metaDescription: "Informations techniques générales concernant le site Azertykeycaps.",
    },
    suggest: {
      title: "Suggérez un keyset !",
      description:
        "Vous avez un keyset en tête qui n'est pas présent sur le site ? Vous pouvez le suggérer ici, et nous l'ajouterons s'il correspond aux critères de sélection.",
      comingSoon: "Le formulaire de suggestion sera bientôt disponible.",
      metaTitle: "Azertykeycaps - Suggestion",
      metaDescription: "Suggérez un keyset à ajouter sur Azertykeycaps.",
    },
    profile: {
      noArticles: "Aucun article pour ce profil",
      noArticlesDescription:
        "Nous n'avons pas encore de keysets pour ce profil en particulier, veuillez réessayer plus tard.",
      noFilterResults: "Essayez de modifier vos filtres pour trouver des articles.",
    },
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
