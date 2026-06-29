import { describe, it, expect } from "vitest";
import { calculer_devis } from "./calculer_devis";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const j = (jours: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + jours);
  return d;
};

const maintenant = new Date();

// Référence neutre : saison moyenne (octobre), DD_NORMAL (45j), capacité 0% (30 pax)
const DEMANDE_REF  = new Date("2026-08-16"); // 45j avant départ
const DEPART_OCT   = new Date("2026-10-01"); // octobre = saison moyenne 0%

// ─── Grille tarifaire ─────────────────────────────────────────────────────────

describe("grille tarifaire — paliers exacts du PDF", () => {
  it("≤ 10 km → 250 €", () => {
    const res = calculer_devis({ distanceKm: 10, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(250);
  });

  it("5 km → arrondi au palier 10 km → 250 €", () => {
    const res = calculer_devis({ distanceKm: 5, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(250);
  });

  it("31 km → palier 40 km → 320 €", () => {
    const res = calculer_devis({ distanceKm: 31, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(320);
  });

  it("80 km → 500 €", () => {
    const res = calculer_devis({ distanceKm: 80, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(500);
  });

  it("180 km exactement → forfait → 900 €", () => {
    const res = calculer_devis({ distanceKm: 180, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(900);
    expect(res.details[0]?.label).toMatch(/forfait/i);
  });

  it("181 km → formule longue distance = 905 €", () => {
    const res = calculer_devis({ distanceKm: 181, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details[0]?.montant).toBe(181 * 2 * 2.5);
    expect(res.details[0]?.label).toMatch(/longue distance/i);
  });
});

// ─── Aller-retour ─────────────────────────────────────────────────────────────

describe("aller-retour", () => {
  it("aller-retour = transfert simple × 2 (tous autres paramètres identiques)", () => {
    const base = { distanceKm: 80, nombrePassagers: 30, dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF };
    const simple = calculer_devis({ ...base, typeTransfert: "simple" });
    const ar     = calculer_devis({ ...base, typeTransfert: "aller_retour" });
    expect(simple.type).toBe("prix");
    expect(ar.type).toBe("prix");
    if (simple.type !== "prix" || ar.type !== "prix") return;
    expect(ar.prixTTC).toBeCloseTo(simple.prixTTC * 2, 1);
  });
});

// ─── Saisonnalité ─────────────────────────────────────────────────────────────

describe("coefficients saisonnalité — valeurs PDF", () => {
  const paramBase = { distanceKm: 100, nombrePassagers: 30, typeTransfert: "simple" as const, dateDemande: new Date("2026-01-01") };

  it("août → basse saison -7 % (×0,93)", () => {
    // Basse : novembre, janvier, février, août
    const ref  = calculer_devis({ ...paramBase, dateDepart: new Date("2026-10-01"), dateDemande: new Date("2026-08-16") }); // oct = moyenne
    const aout = calculer_devis({ ...paramBase, dateDepart: new Date("2026-08-01"), dateDemande: new Date("2026-06-16") }); // août = basse
    expect(ref.type).toBe("prix"); expect(aout.type).toBe("prix");
    if (ref.type !== "prix" || aout.type !== "prix") return;
    expect(aout.prixTTC / ref.prixTTC).toBeCloseTo(0.93, 4);
  });

  it("juillet → haute saison +10 % (×1,10)", () => {
    const ref   = calculer_devis({ ...paramBase, dateDepart: new Date("2026-10-01"), dateDemande: new Date("2026-08-16") });
    const juill = calculer_devis({ ...paramBase, dateDepart: new Date("2026-07-01"), dateDemande: new Date("2026-05-16") });
    expect(ref.type).toBe("prix"); expect(juill.type).toBe("prix");
    if (ref.type !== "prix" || juill.type !== "prix") return;
    expect(juill.prixTTC / ref.prixTTC).toBeCloseTo(1.10, 4);
  });

  it("mai → très haute saison +15 % (×1,15)", () => {
    const ref = calculer_devis({ ...paramBase, dateDepart: new Date("2026-10-01"), dateDemande: new Date("2026-08-16") });
    const mai = calculer_devis({ ...paramBase, dateDepart: new Date("2026-05-01"), dateDemande: new Date("2026-03-16") });
    expect(ref.type).toBe("prix"); expect(mai.type).toBe("prix");
    if (ref.type !== "prix" || mai.type !== "prix") return;
    expect(mai.prixTTC / ref.prixTTC).toBeCloseTo(1.15, 4);
  });
});

// ─── Pondération délai ────────────────────────────────────────────────────────

describe("pondération délai demande → départ", () => {
  const paramBase = { distanceKm: 100, nombrePassagers: 30, typeTransfert: "simple" as const, dateDepart: DEPART_OCT };

  it("0 j → DD_PRIORITAIRE +10 % (×1,10)", () => {
    const res = calculer_devis({ ...paramBase, dateDemande: DEPART_OCT });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    const ligneDelai = res.details.find(d => d.label.includes("DD_PRIORITAIRE"));
    expect(ligneDelai).toBeDefined();
  });

  it("14 j → DD_PRIORITAIRE (limite incluse)", () => {
    const demande = new Date("2026-09-17"); // 14j avant le 01/10
    const res = calculer_devis({ ...paramBase, dateDemande: demande });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details.some(d => d.label.includes("DD_PRIORITAIRE"))).toBe(true);
  });

  it("15 j → DD_URGENT +5 %", () => {
    const demande = new Date("2026-09-16"); // 15j avant le 01/10
    const res = calculer_devis({ ...paramBase, dateDemande: demande });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details.some(d => d.label.includes("DD_URGENT"))).toBe(true);
  });

  it("31 j → DD_NORMAL -5 %", () => {
    const demande = new Date("2026-08-31"); // 31j avant le 01/10
    const res = calculer_devis({ ...paramBase, dateDemande: demande });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details.some(d => d.label.includes("DD_NORMAL"))).toBe(true);
  });

  it("91 j → DD_3MOISETPLUS -10 %", () => {
    const demande = new Date("2026-07-02"); // 91j avant le 01/10
    const res = calculer_devis({ ...paramBase, dateDemande: demande });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.details.some(d => d.label.includes("DD_3MOISETPLUS"))).toBe(true);
  });
});

// ─── Pondération capacité ─────────────────────────────────────────────────────

describe("pondération capacité véhicule", () => {
  const paramBase = { distanceKm: 100, typeTransfert: "simple" as const, dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF };
  // Référence neutre : 30 pax (zone 0% = ×1,00)
  const refRes = () => calculer_devis({ ...paramBase, nombrePassagers: 30 });

  it("≤ 19 pax → coeff -5 % (×0,95)", () => {
    const ref  = refRes();
    const res  = calculer_devis({ ...paramBase, nombrePassagers: 19 });
    expect(ref.type).toBe("prix"); expect(res.type).toBe("prix");
    if (ref.type !== "prix" || res.type !== "prix") return;
    expect(res.prixTTC / ref.prixTTC).toBeCloseTo(0.95, 4);
  });

  it("53 pax → coeff 0 % (×1,00)", () => {
    const ref = refRes();
    const res = calculer_devis({ ...paramBase, nombrePassagers: 53 });
    expect(ref.type).toBe("prix"); expect(res.type).toBe("prix");
    if (ref.type !== "prix" || res.type !== "prix") return;
    expect(res.prixTTC).toBeCloseTo(ref.prixTTC, 1);
  });

  it("54 pax → coeff +15 % (×1,15)", () => {
    const ref = refRes();
    const res = calculer_devis({ ...paramBase, nombrePassagers: 54 });
    expect(ref.type).toBe("prix"); expect(res.type).toBe("prix");
    if (ref.type !== "prix" || res.type !== "prix") return;
    expect(res.prixTTC / ref.prixTTC).toBeCloseTo(1.15, 4);
  });

  it("64 pax → coeff +20 % (×1,20)", () => {
    const ref = refRes();
    const res = calculer_devis({ ...paramBase, nombrePassagers: 64 });
    expect(ref.type).toBe("prix"); expect(res.type).toBe("prix");
    if (ref.type !== "prix" || res.type !== "prix") return;
    expect(res.prixTTC / ref.prixTTC).toBeCloseTo(1.20, 4);
  });

  it("68 pax → coeff +40 % (×1,40)", () => {
    const ref = refRes();
    const res = calculer_devis({ ...paramBase, nombrePassagers: 68 });
    expect(ref.type).toBe("prix"); expect(res.type).toBe("prix");
    if (ref.type !== "prix" || res.type !== "prix") return;
    expect(res.prixTTC / ref.prixTTC).toBeCloseTo(1.40, 4);
  });

  it("85 pax → prix valide (seuil inclus)", () => {
    const res = calculer_devis({ ...paramBase, nombrePassagers: 85 });
    expect(res.type).toBe("prix");
  });
});

// ─── Cas limites ──────────────────────────────────────────────────────────────

describe("cas limites", () => {
  it("0 passager → erreur_validation PASSAGERS_INVALIDE", () => {
    const res = calculer_devis({ distanceKm: 100, nombrePassagers: 0, typeTransfert: "simple", dateDepart: j(20), dateDemande: maintenant });
    expect(res.type).toBe("erreur_validation");
    if (res.type !== "erreur_validation") return;
    expect(res.code).toBe("PASSAGERS_INVALIDE");
  });

  it("86 passagers → cas_complexe (flux manuel)", () => {
    const res = calculer_devis({ distanceKm: 100, nombrePassagers: 86, typeTransfert: "simple", dateDepart: j(20), dateDemande: maintenant });
    expect(res.type).toBe("cas_complexe");
    if (res.type !== "cas_complexe") return;
    expect(res.nombrePassagers).toBe(86);
  });

  it("distance 0 → erreur_validation DISTANCE_INVALIDE", () => {
    const res = calculer_devis({ distanceKm: 0, nombrePassagers: 20, typeTransfert: "simple", dateDepart: j(20), dateDemande: maintenant });
    expect(res.type).toBe("erreur_validation");
    if (res.type !== "erreur_validation") return;
    expect(res.code).toBe("DISTANCE_INVALIDE");
  });

  it("date départ < date demande → erreur_validation DATE_PASSEE", () => {
    const res = calculer_devis({ distanceKm: 100, nombrePassagers: 20, typeTransfert: "simple", dateDepart: new Date("2024-01-10"), dateDemande: new Date("2024-01-20") });
    expect(res.type).toBe("erreur_validation");
    if (res.type !== "erreur_validation") return;
    expect(res.code).toBe("DATE_PASSEE");
  });

  it("marge 15 % et TVA 10 % cohérentes avec prixHT", () => {
    const res = calculer_devis({ distanceKm: 100, nombrePassagers: 30, typeTransfert: "simple", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    expect(res.tva).toBeCloseTo(res.prixHT * 0.10, 1);
    expect(res.prixTTC).toBeCloseTo(res.prixHT * 1.10, 1);
  });

  it("détail ligne à ligne : labels non vides et montants positifs", () => {
    const res = calculer_devis({ distanceKm: 80, nombrePassagers: 30, typeTransfert: "aller_retour", dateDepart: DEPART_OCT, dateDemande: DEMANDE_REF });
    expect(res.type).toBe("prix");
    if (res.type !== "prix") return;
    for (const ligne of res.details) {
      expect(ligne.label.length).toBeGreaterThan(0);
      expect(ligne.montant).toBeGreaterThan(0);
    }
  });
});
