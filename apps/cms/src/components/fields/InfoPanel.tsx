"use client";

import type { UIFieldClientComponent } from "payload";

const baseStyles: React.CSSProperties = {
  padding: "12px 16px",
  marginBottom: "16px",
  borderRadius: "4px",
  fontSize: "14px",
  lineHeight: "1.5",
};

const infoStyles: React.CSSProperties = {
  ...baseStyles,
  backgroundColor: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-100)",
};

export const LinksInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Configuration des liens
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        L'URL principale est obligatoire et sera utilisée comme lien principal
        du produit. Les liens supplémentaires sont optionnels et peuvent être
        utilisés pour des kits additionnels ou le suivi d'affiliation.
      </span>
    </div>
  );
};

export const GroupBuyInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Informations Group Buy
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        Ces champs sont utilisés pour les articles en Group Buy. Les dates de
        début et fin seront affichées sur la carte de l'article. Le texte
        d'avertissement peut être utilisé pour indiquer des délais de livraison
        ou autres informations importantes.
      </span>
    </div>
  );
};

export const NavInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Configuration de la navigation
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        Ces champs contrôlent l'affichage du profil dans le menu de navigation.
        La description navbar est affichée sous le titre dans le menu déroulant.
        L'icône utilise les noms Lucide (ex: "Cherry", "Box", etc.).
      </span>
    </div>
  );
};

export const ProfilesInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Profils en vedette
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        Sélectionnez les profils de keycaps à afficher sur la page d'accueil.
        L'ordre de sélection détermine l'ordre d'affichage.
      </span>
    </div>
  );
};

export const SeoInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Optimisation pour les moteurs de recherche
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        Le titre meta apparaît dans l'onglet du navigateur et les résultats de
        recherche (50-60 caractères recommandés). La description meta est
        affichée sous le titre dans les résultats de recherche (150-160
        caractères recommandés).
      </span>
    </div>
  );
};

export const SocialInfoPanel: UIFieldClientComponent = () => {
  return (
    <div style={infoStyles}>
      <strong style={{ display: "block", marginBottom: "4px" }}>
        Réseaux sociaux
      </strong>
      <span style={{ color: "var(--theme-elevation-800)" }}>
        Configurez les liens vers vos réseaux sociaux qui seront affichés dans
        le pied de page du site. Les icônes utilisent la bibliothèque Lucide
        (ex: "Twitter", "Github", "Instagram").
      </span>
    </div>
  );
};

export default LinksInfoPanel;
