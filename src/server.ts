import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { calculer_devis, type ParametresDevis, type TypeTransfert } from "./calculer_devis";

const PORT = process.env["PORT"] != null ? parseInt(process.env["PORT"]) : 3000;

function lireCorps(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let corps = "";
    req.on("data", (chunk: Buffer) => { corps += chunk.toString(); });
    req.on("end", () => { resolve(corps); });
    req.on("error", reject);
  });
}

function repondre(res: ServerResponse, statut: number, corps: unknown): void {
  res.writeHead(statut, { "Content-Type": "application/json" });
  res.end(JSON.stringify(corps, null, 2));
}

function validerTypeTransfert(v: unknown): v is TypeTransfert {
  return v === "simple" || v === "aller_retour";
}

const serveur = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Health-check pour n8n
  if (req.method === "GET" && req.url === "/health") {
    repondre(res, 200, { statut: "ok", service: "neotravel-pricing" });
    return;
  }

  // Endpoint principal : POST /devis
  if (req.method === "POST" && req.url === "/devis") {
    let corps: string;
    try {
      corps = await lireCorps(req);
    } catch {
      repondre(res, 400, { type: "erreur_validation", code: "LECTURE_CORPS", message: "Impossible de lire le corps de la requête." });
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(corps) as Record<string, unknown>;
    } catch {
      repondre(res, 400, { type: "erreur_validation", code: "JSON_INVALIDE", message: "Corps JSON invalide." });
      return;
    }

    const typeTransfert = body["typeTransfert"];
    if (!validerTypeTransfert(typeTransfert)) {
      repondre(res, 400, {
        type: "erreur_validation",
        code: "TYPE_TRANSFERT_INVALIDE",
        message: `typeTransfert doit être "simple" ou "aller_retour", reçu : ${String(typeTransfert)}`,
      });
      return;
    }

    const dateDemande = body["dateDemande"] != null
      ? new Date(String(body["dateDemande"]))
      : new Date();

    const params: ParametresDevis = {
      distanceKm:       Number(body["distanceKm"]),
      nombrePassagers:  Number(body["nombrePassagers"]),
      typeTransfert,
      dateDepart:  new Date(String(body["dateDepart"])),
      dateDemande,
    };

    if (isNaN(params.distanceKm) || isNaN(params.nombrePassagers) ||
        isNaN(params.dateDepart.getTime()) || isNaN(params.dateDemande.getTime())) {
      repondre(res, 400, {
        type: "erreur_validation",
        code: "CHAMPS_MANQUANTS",
        message: "Champs requis : distanceKm (number), nombrePassagers (number), typeTransfert, dateDepart (ISO).",
      });
      return;
    }

    const resultat = calculer_devis(params);
    const statut = resultat.type === "prix" ? 200 : resultat.type === "cas_complexe" ? 200 : 422;
    repondre(res, statut, resultat);
    return;
  }

  // Endpoint de test pour valider le flux n8n avant branchement du vrai moteur
  if (req.method === "POST" && req.url === "/devis-test") {
    repondre(res, 200, {
      type: "prix",
      prixHT: 695.50,
      tva: 69.55,
      prixTTC: 765.05,
      details: [
        { label: "Forfait ≤ 100 km", montant: 580 },
        { label: "Saison moyenne ×1,00", montant: 580 },
        { label: "DD_NORMAL −5 %", montant: 551 },
        { label: "Capacité 20–53 pax ×1,00", montant: 551 },
        { label: "Marge +15 %", montant: 633.65 },
        { label: "TVA 10 %", montant: 63.37 },
      ],
      _test: true,
      _note: "Endpoint de test — prix fixe, indépendant des paramètres envoyés",
    });
    return;
  }

  repondre(res, 404, { error: "Route inconnue. Disponible : POST /devis, POST /devis-test, GET /health" });
});

serveur.listen(PORT, () => {
  console.log(`Moteur de devis NeoTravel en écoute → http://localhost:${PORT}`);
  console.log(`  POST /devis    — calculer un devis`);
  console.log(`  GET  /health   — vérification santé`);
});
