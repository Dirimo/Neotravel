/**
 * Crée les 6 tables Airtable et insère les données de référence (règles PDF NeoTravel).
 * Idempotent : les tables existantes sont ignorées, les données sont toujours remises à jour.
 * Usage : npm run setup:airtable
 */

import "dotenv/config";

const PAT = process.env["AIRTABLE_PAT"];
const BASE_ID = process.env["AIRTABLE_BASE_ID"];

if (!PAT || !BASE_ID) {
  console.error("❌  Variables manquantes — copie .env.example vers .env et remplis les valeurs.");
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
};

// ─── Helpers HTTP ─────────────────────────────────────────────────────────────

interface AirtableTableMeta { id: string; name: string }
interface AirtableRecord { id: string; fields?: Record<string, unknown> }

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ─── Tables ───────────────────────────────────────────────────────────────────

async function tablesExistantes(): Promise<Map<string, string>> {
  const data = await apiGet<{ tables: AirtableTableMeta[] }>(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`
  );
  return new Map(data.tables.map((t) => [t.name, t.id]));
}

async function creerTable(existantes: Map<string, string>, nom: string, champs: unknown[]): Promise<string> {
  const id = existantes.get(nom);
  if (id) { console.log(`  ↳ "${nom}" déjà présente, ignorée.`); return id; }
  const data = await apiPost<{ id: string }>(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
    { name: nom, fields: champs }
  );
  console.log(`  ✓ "${nom}" créée (${data.id})`);
  return data.id;
}

// ─── Enregistrements ──────────────────────────────────────────────────────────

async function lireTout(tableId: string): Promise<AirtableRecord[]> {
  const tous: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const qs = offset ? `?offset=${offset}` : "";
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}${qs}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`GET records → ${res.status} ${await res.text()}`);
    const data = await res.json() as { records: AirtableRecord[]; offset?: string };
    tous.push(...data.records);
    offset = data.offset;
  } while (offset);
  return tous;
}

async function viderTable(tableId: string): Promise<void> {
  const records = await lireTout(tableId);
  if (records.length === 0) return;
  for (let i = 0; i < records.length; i += 10) {
    const ids = records.slice(i, i + 10).map((r) => r.id);
    const qs = ids.map((id) => `records[]=${id}`).join("&");
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}?${qs}`, {
      method: "DELETE", headers: HEADERS,
    });
    if (!res.ok) throw new Error(`DELETE records → ${res.status} ${await res.text()}`);
  }
}

async function inserer(tableId: string, records: Record<string, unknown>[]): Promise<void> {
  for (let i = 0; i < records.length; i += 10) {
    const lot = records.slice(i, i + 10).map((fields) => ({ fields }));
    await apiPost<{ records: AirtableRecord[] }>(
      `https://api.airtable.com/v0/${BASE_ID}/${tableId}`,
      { records: lot }
    );
  }
}

// ─── Définitions des tables ───────────────────────────────────────────────────

function defClients() {
  return [
    { name: "Nom", type: "singleLineText" },
    { name: "Email", type: "email" },
    { name: "Téléphone", type: "phoneNumber" },
    { name: "Entreprise", type: "singleLineText" },
    {
      name: "Statut", type: "singleSelect", options: {
        choices: [
          { name: "Prospect" }, { name: "Actif" }, { name: "Inactif" }
        ]
      }
    },
    { name: "Date_création", type: "date", options: { dateFormat: { name: "european" } } },
    { name: "Notes", type: "multilineText" },
  ];
}

function defMatrices() {
  return [
    { name: "Nom", type: "singleLineText" },
    {
      name: "Catégorie", type: "singleSelect", options: {
        choices: [
          { name: "Saison" }, { name: "Délai" }, { name: "Capacité" }
        ]
      }
    },
    { name: "Condition", type: "singleLineText" },
    { name: "Coefficient", type: "number", options: { precision: 2 } },
    { name: "Label", type: "singleLineText" },
    { name: "Actif", type: "checkbox", options: { icon: "check", color: "greenBright" } },
    { name: "Ordre", type: "number", options: { precision: 0 } },
  ];
}

function defGrilleTarifs() {
  return [
    { name: "Zone", type: "singleLineText" },
    { name: "Km_max", type: "number", options: { precision: 0 } },
    { name: "Prix_base", type: "currency", options: { symbol: "€", precision: 2 } },
    { name: "Actif", type: "checkbox", options: { icon: "check", color: "greenBright" } },
    { name: "Description", type: "singleLineText" },
  ];
}

function defDemandes(clientsId: string) {
  return [
    { name: "Référence", type: "singleLineText" },
    { name: "Client", type: "multipleRecordLinks", options: { linkedTableId: clientsId } },
    {
      name: "Date_demande", type: "dateTime", options: {
        timeZone: "Europe/Paris",
        dateFormat: { name: "european" },
        timeFormat: { name: "24hour" },
      }
    },
    { name: "Date_départ", type: "date", options: { dateFormat: { name: "european" } } },
    { name: "Distance_km", type: "number", options: { precision: 1 } },
    { name: "Nombre_passagers", type: "number", options: { precision: 0 } },
    {
      name: "Type_transfert", type: "singleSelect", options: {
        choices: [
          { name: "simple" }, { name: "aller_retour" }
        ]
      }
    },
    { name: "Lieu_départ", type: "singleLineText" },
    { name: "Lieu_arrivée", type: "singleLineText" },
    {
      name: "Statut", type: "singleSelect", options: {
        choices: [
          { name: "Reçue" }, { name: "En_cours" }, { name: "Devis_envoyé" },
          { name: "Confirmée" }, { name: "Annulée" }
        ]
      }
    },
    { name: "Notes", type: "multilineText" },
  ];
}

function defDevis(demandesId: string) {
  return [
    { name: "Numéro", type: "singleLineText" },
    { name: "Demande", type: "multipleRecordLinks", options: { linkedTableId: demandesId } },
    { name: "Date_création", type: "date", options: { dateFormat: { name: "european" } } },
    { name: "Date_validité", type: "date", options: { dateFormat: { name: "european" } } },
    { name: "Prix_HT", type: "currency", options: { symbol: "€", precision: 2 } },
    { name: "TVA", type: "currency", options: { symbol: "€", precision: 2 } },
    { name: "Prix_TTC", type: "currency", options: { symbol: "€", precision: 2 } },
    { name: "Détail_JSON", type: "multilineText" },
    {
      name: "Type_résultat", type: "singleSelect", options: {
        choices: [
          { name: "prix" }, { name: "cas_complexe" }, { name: "erreur_validation" }
        ]
      }
    },
    {
      name: "Statut", type: "singleSelect", options: {
        choices: [
          { name: "Brouillon" }, { name: "Envoyé" }, { name: "Accepté" },
          { name: "Refusé" }, { name: "Expiré" }
        ]
      }
    },
    { name: "Notes", type: "multilineText" },
  ];
}

function defRelances(devisId: string) {
  return [
    { name: "ID", type: "singleLineText" },
    { name: "Devis", type: "multipleRecordLinks", options: { linkedTableId: devisId } },
    { name: "Date_relance", type: "date", options: { dateFormat: { name: "european" } } },
    {
      name: "Canal", type: "singleSelect", options: {
        choices: [
          { name: "Email" }, { name: "SMS" }, { name: "Téléphone" }
        ]
      }
    },
    {
      name: "Statut", type: "singleSelect", options: {
        choices: [
          { name: "Planifiée" }, { name: "Envoyée" }, { name: "Réponse_reçue" }, { name: "Abandonnée" }
        ]
      }
    },
    { name: "Notes", type: "multilineText" },
  ];
}

// ─── Données de référence — source : règles de calcul cotation NeoTravel ──────

const MATRICES: Record<string, unknown>[] = [
  { Nom: "basse_saison", Catégorie: "Saison", Condition: "mois IN [11,1,2,8]", Coefficient: 0.93, Label: "Basse saison -7 % (nov/jan/fév/août)", Actif: true, Ordre: 10 },
  { Nom: "saison_moyenne", Catégorie: "Saison", Condition: "mois IN [12,10,9]", Coefficient: 1.00, Label: "Saison moyenne 0 % (déc/oct/sept)", Actif: true, Ordre: 20 },
  { Nom: "haute_saison", Catégorie: "Saison", Condition: "mois IN [3,4,7]", Coefficient: 1.10, Label: "Haute saison +10 % (mars/avr/juil)", Actif: true, Ordre: 30 },
  { Nom: "tres_haute_saison", Catégorie: "Saison", Condition: "mois IN [5,6]", Coefficient: 1.15, Label: "Très haute saison +15 % (mai/juin)", Actif: true, Ordre: 40 },
  { Nom: "DD_PRIORITAIRE", Catégorie: "Délai", Condition: "jours <= 14", Coefficient: 1.10, Label: "DD_PRIORITAIRE ≤ 14j +10 %", Actif: true, Ordre: 10 },
  { Nom: "DD_URGENT", Catégorie: "Délai", Condition: "14j < jours <= 30j", Coefficient: 1.05, Label: "DD_URGENT 14-30j +5 %", Actif: true, Ordre: 20 },
  { Nom: "DD_NORMAL", Catégorie: "Délai", Condition: "30j < jours <= 90j", Coefficient: 0.95, Label: "DD_NORMAL 30-90j -5 %", Actif: true, Ordre: 30 },
  { Nom: "DD_3MOISETPLUS", Catégorie: "Délai", Condition: "jours > 90j", Coefficient: 0.90, Label: "DD_3MOISETPLUS > 90j -10 %", Actif: true, Ordre: 40 },
  { Nom: "cap_19", Catégorie: "Capacité", Condition: "pax <= 19", Coefficient: 0.95, Label: "Capacité ≤ 19 pax -5 %", Actif: true, Ordre: 10 },
  { Nom: "cap_53", Catégorie: "Capacité", Condition: "pax <= 53", Coefficient: 1.00, Label: "Capacité 20-53 pax 0 %", Actif: true, Ordre: 20 },
  { Nom: "cap_63", Catégorie: "Capacité", Condition: "pax <= 63", Coefficient: 1.15, Label: "Capacité 54-63 pax +15 %", Actif: true, Ordre: 30 },
  { Nom: "cap_67", Catégorie: "Capacité", Condition: "pax <= 67", Coefficient: 1.20, Label: "Capacité 64-67 pax +20 %", Actif: true, Ordre: 40 },
  { Nom: "cap_85", Catégorie: "Capacité", Condition: "pax <= 85", Coefficient: 1.40, Label: "Capacité 68-85 pax +40 %", Actif: true, Ordre: 50 },
];

const GRILLE_TARIFS: Record<string, unknown>[] = [
  { Zone: "10 km", Km_max: 10, Prix_base: 250, Actif: true, Description: "≤ 10 km" },
  { Zone: "20 km", Km_max: 20, Prix_base: 250, Actif: true, Description: "11-20 km" },
  { Zone: "30 km", Km_max: 30, Prix_base: 250, Actif: true, Description: "21-30 km" },
  { Zone: "40 km", Km_max: 40, Prix_base: 320, Actif: true, Description: "31-40 km" },
  { Zone: "50 km", Km_max: 50, Prix_base: 350, Actif: true, Description: "41-50 km" },
  { Zone: "60 km", Km_max: 60, Prix_base: 390, Actif: true, Description: "51-60 km" },
  { Zone: "70 km", Km_max: 70, Prix_base: 430, Actif: true, Description: "61-70 km" },
  { Zone: "80 km", Km_max: 80, Prix_base: 500, Actif: true, Description: "71-80 km" },
  { Zone: "90 km", Km_max: 90, Prix_base: 540, Actif: true, Description: "81-90 km" },
  { Zone: "100 km", Km_max: 100, Prix_base: 580, Actif: true, Description: "91-100 km" },
  { Zone: "110 km", Km_max: 110, Prix_base: 620, Actif: true, Description: "101-110 km" },
  { Zone: "120 km", Km_max: 120, Prix_base: 660, Actif: true, Description: "111-120 km" },
  { Zone: "130 km", Km_max: 130, Prix_base: 700, Actif: true, Description: "121-130 km" },
  { Zone: "140 km", Km_max: 140, Prix_base: 740, Actif: true, Description: "131-140 km" },
  { Zone: "150 km", Km_max: 150, Prix_base: 780, Actif: true, Description: "141-150 km" },
  { Zone: "160 km", Km_max: 160, Prix_base: 820, Actif: true, Description: "151-160 km" },
  { Zone: "170 km", Km_max: 170, Prix_base: 860, Actif: true, Description: "161-170 km" },
  { Zone: "180 km", Km_max: 180, Prix_base: 900, Actif: true, Description: "171-180 km" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔧  Setup NeoTravel Pricing — base ${BASE_ID}\n`);

  // Étape 1 : lire les tables existantes
  const existantes = await tablesExistantes();
  console.log(`📋  ${existantes.size} table(s) déjà présente(s).\n`);

  // Étape 2 : créer les tables sans dépendances
  console.log("── Tables de référence ──────────────────────────────────────");
  const clientsId = await creerTable(existantes, "Clients", defClients());
  const matricesId = await creerTable(existantes, "Matrices", defMatrices());
  const grilleTarifsId = await creerTable(existantes, "Grille_Tarifs", defGrilleTarifs());

  // Étape 3 : créer les tables relationnelles (dans l'ordre des dépendances)
  console.log("\n── Tables relationnelles ────────────────────────────────────");
  const demandesId = await creerTable(existantes, "Demandes", defDemandes(clientsId));
  const devisId = await creerTable(existantes, "Devis", defDevis(demandesId));
  await creerTable(existantes, "Relances", defRelances(devisId));

  // Étape 4 : (re)mettre les données de référence à jour
  console.log("\n── Données de référence ─────────────────────────────────────");
  await viderTable(matricesId);
  await inserer(matricesId, MATRICES);
  console.log(`  ✓ ${MATRICES.length} coefficients dans Matrices.`);

  await viderTable(grilleTarifsId);
  await inserer(grilleTarifsId, GRILLE_TARIFS);
  console.log(`  ✓ ${GRILLE_TARIFS.length} zones tarifaires dans Grille_Tarifs.`);

  console.log("\n✅  Setup terminé.\n");
}

main().catch((err) => {
  console.error("❌  Erreur :", err);
  process.exit(1);
});
