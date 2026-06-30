/**
 * Client Airtable pour NeoTravel Pricing.
 * Expose des fonctions typées pour lire/écrire dans les 6 tables.
 */

import "dotenv/config";

const PAT     = process.env["AIRTABLE_PAT"]     ?? "";
const BASE_ID = process.env["AIRTABLE_BASE_ID"] ?? "";
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

// ─── Types publics ────────────────────────────────────────────────────────────

export interface MatriceRecord {
  id: string;
  nom: string;
  categorie: "Saison" | "Délai" | "Capacité";
  condition: string;
  coefficient: number;
  label: string;
  ordre: number;
}

export interface GrilleTarifRecord {
  id: string;
  zone: string;
  kmMax: number;
  prixBase: number;
}

export interface DemandeInput {
  reference: string;
  clientId?: string;
  dateDemande: Date;
  dateDepart: Date;
  distanceKm: number;
  nombrePassagers: number;
  typeTransfert: "simple" | "aller_retour";
  lieuDepart?: string;
  lieuArrivee?: string;
  notes?: string;
}

export interface DevisInput {
  demandeId?: string;
  dateCreation: Date;
  dateValidite: Date;
  prixHT: number;
  tva: number;
  prixTTC: number;
  detailJson: string;
  typeResultat: "prix" | "cas_complexe" | "erreur_validation";
  statut?: "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";
  userEmail?: string;
}

// ─── Types internes ───────────────────────────────────────────────────────────

interface AirtableFields {
  [key: string]: unknown;
}

interface AirtableRecord {
  id: string;
  fields: AirtableFields;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableCreateResponse {
  id: string;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const corps = await res.text();
    throw new Error(`Airtable ${init?.method ?? "GET"} ${url} → ${res.status}: ${corps}`);
  }
  return res.json() as Promise<T>;
}

// ─── Lecture paginée ──────────────────────────────────────────────────────────

async function toutLire(table: string, params: Record<string, string> = {}): Promise<AirtableRecord[]> {
  const tous: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const qs = new URLSearchParams({ ...params, ...(offset ? { offset } : {}) });
    const data = await http<AirtableListResponse>(`${BASE_URL}/${encodeURIComponent(table)}?${qs}`);
    tous.push(...data.records);
    offset = data.offset;
  } while (offset);

  return tous;
}

// ─── Fonctions de lecture ─────────────────────────────────────────────────────

/** Lit tous les coefficients actifs, triés par catégorie puis ordre. */
export async function lireMatrices(): Promise<MatriceRecord[]> {
  const records = await toutLire("Matrices", {
    filterByFormula: "{Actif} = TRUE()",
    sort: JSON.stringify([
      { field: "Catégorie", direction: "asc" },
      { field: "Ordre",     direction: "asc" },
    ]),
  });

  return records.map((r) => ({
    id:          r.id,
    nom:         String(r.fields["Nom"]         ?? ""),
    categorie:   r.fields["Catégorie"] as MatriceRecord["categorie"],
    condition:   String(r.fields["Condition"]   ?? ""),
    coefficient: Number(r.fields["Coefficient"] ?? 1),
    label:       String(r.fields["Label"]       ?? ""),
    ordre:       Number(r.fields["Ordre"]       ?? 0),
  }));
}

/** Lit la grille de tarifs active, triée par Km_max croissant. */
export async function lireGrilleTarifs(): Promise<GrilleTarifRecord[]> {
  const records = await toutLire("Grille_Tarifs", {
    filterByFormula: "{Actif} = TRUE()",
    sort: JSON.stringify([{ field: "Km_max", direction: "asc" }]),
  });

  return records.map((r) => ({
    id:       r.id,
    zone:     String(r.fields["Zone"]      ?? ""),
    kmMax:    Number(r.fields["Km_max"]    ?? 0),
    prixBase: Number(r.fields["Prix_base"] ?? 0),
  }));
}

// ─── Fonctions d'écriture ─────────────────────────────────────────────────────

/** Crée une demande et renvoie son ID Airtable. */
export async function creerDemande(input: DemandeInput): Promise<string> {
  const fields: AirtableFields = {
    Référence:        input.reference,
    Date_demande:     input.dateDemande.toISOString(),
    "Date_départ":    input.dateDepart.toISOString().split("T")[0],
    Distance_km:      input.distanceKm,
    Nombre_passagers: input.nombrePassagers,
    Type_transfert:   input.typeTransfert,
    Statut:           "Reçue",
  };

  if (input.clientId)    fields["Client"]     = [{ id: input.clientId }];
  if (input.lieuDepart)  fields["Lieu_départ"] = input.lieuDepart;
  if (input.lieuArrivee) fields["Lieu_arrivée"] = input.lieuArrivee;
  if (input.notes)       fields["Notes"]       = input.notes;

  const data = await http<AirtableCreateResponse>(`${BASE_URL}/Demandes`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  return data.id;
}

/** Crée un devis et renvoie son ID Airtable. */
export async function creerDevis(input: DevisInput): Promise<string> {
  const fields: AirtableFields = {
    "date création":  input.dateCreation.toISOString().split("T")[0],
    "date validité":  input.dateValidite.toISOString().split("T")[0],
    "prix HT":        input.prixHT,
    "tva":            input.tva,
    "prix TTC":       input.prixTTC,
    "détail json":    input.detailJson,
    "type résultat":  input.typeResultat,
    "statut":         input.statut ?? "Brouillon",
  };

  if (input.demandeId) fields["Demande"] = [{ id: input.demandeId }];
  if (input.userEmail) fields["Utilisateurs"] = input.userEmail;

  const data = await http<AirtableCreateResponse>(`${BASE_URL}/Devis`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  return data.id;
}

/** Met à jour le statut d'un devis. */
export async function mettreAJourStatutDevis(
  devisId: string,
  statut: "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré"
): Promise<void> {
  await http<AirtableRecord>(`${BASE_URL}/Devis/${devisId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { Statut: statut } }),
  });
}

// ─── Auth utilisateurs ────────────────────────────────────────────────────────

export async function creerUtilisateur(
  email: string, mdpHash: string, prenom: string, nom: string
): Promise<string> {
  const data = await http<AirtableCreateResponse>(`${BASE_URL}/Utilisateurs`, {
    method: "POST",
    body: JSON.stringify({
      fields: {
        "Email": email,
        "Mot de passe": mdpHash,
        "Prénom": prenom,
        "Nom": nom,
        "Date": new Date().toISOString().split("T")[0],
      },
    }),
  });
  return data.id;
}

export async function trouverUtilisateur(
  email: string
): Promise<{ id: string; mdpHash: string } | null> {
  const records = await toutLire("Utilisateurs", {
    filterByFormula: `{Email} = "${email}"`,
    maxRecords: "1",
  });
  const record = records[0];
  if (record == null) return null;
  return {
    id: record.id,
    mdpHash: String(record.fields["Mot de passe"] ?? ""),
  };
}

export async function lireDevisUtilisateur(email: string): Promise<AirtableRecord[]> {
  return toutLire("Devis", {
    filterByFormula: `{Utilisateurs} = "${email}"`,
  });
}
