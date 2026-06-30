export type TypeTransfert = "simple" | "aller_retour";

export interface ParametresDevis {
  distanceKm: number;
  nombrePassagers: number;
  typeTransfert: TypeTransfert;
  dateDepart: Date;
  dateDemande: Date;
}

export interface LigneDetail {
  label: string;
  montant: number;
}

export interface ResultatDevis {
  type: "prix";
  prixHT: number;
  tva: number;
  prixTTC: number;
  details: LigneDetail[];
}

export interface CasComplexe {
  type: "cas_complexe";
  raison: string;
  nombrePassagers: number;
}

export interface ErreurValidation {
  type: "erreur_validation";
  code: string;
  message: string;
}

export type ReponseDevis = ResultatDevis | CasComplexe | ErreurValidation;

// ─── Constantes ──────────────────────────────────────────────────────────────

const TAUX_MARGE = 0.15;
const TAUX_TVA   = 0.10;
const SEUIL_CAS_COMPLEXE = 85;

// Grille forfait officielle — paliers par tranches de 10 km jusqu'à 180 km
const GRILLE_FORFAIT: ReadonlyArray<{ readonly km: number; readonly prix: number }> = [
  { km: 10,  prix: 250 },
  { km: 20,  prix: 250 },
  { km: 30,  prix: 250 },
  { km: 40,  prix: 320 },
  { km: 50,  prix: 350 },
  { km: 60,  prix: 390 },
  { km: 70,  prix: 430 },
  { km: 80,  prix: 500 },
  { km: 90,  prix: 540 },
  { km: 100, prix: 580 },
  { km: 110, prix: 620 },
  { km: 120, prix: 660 },
  { km: 130, prix: 700 },
  { km: 140, prix: 740 },
  { km: 150, prix: 780 },
  { km: 160, prix: 820 },
  { km: 170, prix: 860 },
  { km: 180, prix: 900 },
];

// ─── Fonctions internes ───────────────────────────────────────────────────────

function prixBase(km: number): LigneDetail {
  if (km > 180) {
    const montant = km * 2 * 2.5;
    return { label: `Longue distance : ${km} km × 2 × 2,5 €`, montant };
  }
  // Cherche le premier palier dont le km max >= distance demandée
  const entree = GRILLE_FORFAIT.find((e) => km <= e.km);
  if (entree == null) {
    // Garde-fou : ne devrait pas arriver après le test > 180
    const montant = km * 2 * 2.5;
    return { label: `Longue distance : ${km} km × 2 × 2,5 €`, montant };
  }
  return { label: `Forfait ≤ ${entree.km} km`, montant: entree.prix };
}

function appliquerAllerRetour(montant: number): LigneDetail {
  return { label: "Aller-retour × 2", montant: montant * 2 };
}

// Saisonnalité — source : règles de calcul cotation NeoTravel
function coeffSaison(date: Date): { coef: number; label: string } {
  const mois = date.getMonth() + 1; // 1-12
  if ([11, 1, 2, 8].includes(mois)) {
    return { coef: 0.93, label: "Basse saison -7 % (nov/jan/fév/août)" };
  }
  if ([12, 10, 9].includes(mois)) {
    return { coef: 1.00, label: "Saison moyenne 0 % (déc/oct/sept)" };
  }
  if ([3, 4, 7].includes(mois)) {
    return { coef: 1.10, label: "Haute saison +10 % (mars/avr/juil)" };
  }
  // mai, juin
  return { coef: 1.15, label: "Très haute saison +15 % (mai/juin)" };
}

// Pondération date demande vs date départ
function coeffDelai(dateDemande: Date, dateDepart: Date): { coef: number; label: string } {
  const msJour = 1000 * 60 * 60 * 24;
  const jours  = Math.floor((dateDepart.getTime() - dateDemande.getTime()) / msJour);
  if (jours <= 14) return { coef: 1.10, label: `Réservation prioritaire (J-${jours}) +10 %` };
  if (jours <= 30) return { coef: 1.05, label: `Réservation urgente (J-${jours}) +5 %` };
  if (jours <= 90) return { coef: 0.95, label: `Réservation standard (J-${jours}) -5 %` };
  return             { coef: 0.90, label: `Réservation anticipée (J-${jours}) -10 %` };
}

// Pondération capacité véhicule
function coeffCapacite(pax: number): { coef: number; label: string } {
  if (pax <= 19) return { coef: 0.95, label: "Capacité ≤ 19 pax -5 %" };
  if (pax <= 53) return { coef: 1.00, label: "Capacité 20-53 pax 0 %" };
  if (pax <= 63) return { coef: 1.15, label: "Capacité 54-63 pax +15 %" };
  if (pax <= 67) return { coef: 1.20, label: "Capacité 64-67 pax +20 %" };
  return          { coef: 1.40, label: "Capacité 68-85 pax +40 %" };
}

function arrondi(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function calculer_devis(params: ParametresDevis): ReponseDevis {
  const { distanceKm, nombrePassagers, typeTransfert, dateDepart, dateDemande } = params;

  if (distanceKm <= 0) {
    return {
      type: "erreur_validation",
      code: "DISTANCE_INVALIDE",
      message: `Distance invalide : ${distanceKm} km. Doit être > 0.`,
    };
  }

  if (nombrePassagers <= 0) {
    return {
      type: "erreur_validation",
      code: "PASSAGERS_INVALIDE",
      message: `Nombre de passagers invalide : ${nombrePassagers}. Doit être ≥ 1.`,
    };
  }

  if (dateDepart < dateDemande) {
    return {
      type: "erreur_validation",
      code: "DATE_PASSEE",
      message: `Date de départ (${dateDepart.toISOString().split("T")[0]}) antérieure à la date de demande.`,
    };
  }

  if (nombrePassagers > SEUIL_CAS_COMPLEXE) {
    return {
      type: "cas_complexe",
      raison: `${nombrePassagers} passagers dépassent le seuil de ${SEUIL_CAS_COMPLEXE} — envoi au commercial requis.`,
      nombrePassagers,
    };
  }

  const details: LigneDetail[] = [];

  // 1. Prix de base (forfait ou formule longue distance)
  const base = prixBase(distanceKm);
  details.push(base);
  let courant = base.montant;

  // 2. Aller-retour : transfert simple × 2
  if (typeTransfert === "aller_retour") {
    const ar = appliquerAllerRetour(courant);
    details.push(ar);
    courant = ar.montant;
  }

  // 3. Coefficient saisonnalité
  const saison = coeffSaison(dateDepart);
  courant = courant * saison.coef;
  details.push({ label: saison.label, montant: arrondi(courant) });

  // 4. Pondération date demande → départ
  const delai = coeffDelai(dateDemande, dateDepart);
  courant = courant * delai.coef;
  details.push({ label: delai.label, montant: arrondi(courant) });

  // 5. Pondération capacité
  const capacite = coeffCapacite(nombrePassagers);
  courant = courant * capacite.coef;
  details.push({ label: capacite.label, montant: arrondi(courant) });

  // 6. Marge +15 %
  courant = courant * (1 + TAUX_MARGE);
  details.push({ label: `Marge +${TAUX_MARGE * 100} %`, montant: arrondi(courant) });

  const prixHT  = arrondi(courant);
  const tva     = arrondi(prixHT * TAUX_TVA);
  const prixTTC = arrondi(prixHT + tva);

  // 7. TVA et total TTC
  details.push({ label: `TVA ${TAUX_TVA * 100} %`, montant: tva });
  details.push({ label: "Prix TTC",                 montant: prixTTC });

  return { type: "prix", prixHT, tva, prixTTC, details };
}
