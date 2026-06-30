import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { calculer_devis, type ParametresDevis, type TypeTransfert } from "./calculer_devis";
import { creerUtilisateur, trouverUtilisateur, lireDevisUtilisateur } from "./airtable-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "neotravel_dev_secret";

const PORT = process.env["BACKEND_PORT"] != null ? parseInt(process.env["BACKEND_PORT"]) : 3001;

function lireCorps(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let corps = "";
    req.on("data", (chunk: Buffer) => { corps += chunk.toString(); });
    req.on("end", () => { resolve(corps); });
    req.on("error", reject);
  });
}

function repondre(res: ServerResponse, statut: number, corps: unknown): void {
  res.writeHead(statut, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(corps, null, 2));
}

function gererOptions(res: ServerResponse): void {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end();
}

function validerTypeTransfert(v: unknown): v is TypeTransfert {
  return v === "simple" || v === "aller_retour";
}

const serveur = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "OPTIONS") { gererOptions(res); return; }

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

  // POST /auth/register — créer un compte
  if (req.method === "POST" && req.url === "/auth/register") {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(await lireCorps(req)) as Record<string, unknown>;
    } catch {
      repondre(res, 400, { error: "JSON invalide" });
      return;
    }
    const { email, mdp, prenom, nom } = body as Record<string, string>;
    if (!email || !mdp || !prenom || !nom) {
      repondre(res, 400, { error: "Champs requis : email, mdp, prenom, nom" });
      return;
    }
    const existant = await trouverUtilisateur(email);
    if (existant) {
      repondre(res, 409, { error: "Un compte existe déjà avec cet email" });
      return;
    }
    const mdpHash = await bcrypt.hash(mdp, 10);
    await creerUtilisateur(email, mdpHash, prenom, nom);
    repondre(res, 201, { message: "Compte créé avec succès" });
    return;
  }

  // POST /auth/login — connexion
  if (req.method === "POST" && req.url === "/auth/login") {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(await lireCorps(req)) as Record<string, unknown>;
    } catch {
      repondre(res, 400, { error: "JSON invalide" });
      return;
    }
    const { email, mdp } = body as Record<string, string>;
    if (!email || !mdp) {
      repondre(res, 400, { error: "Champs requis : email, mdp" });
      return;
    }
    const utilisateur = await trouverUtilisateur(email);
    if (!utilisateur) {
      repondre(res, 401, { error: "Email ou mot de passe incorrect" });
      return;
    }
    const mdpOk = await bcrypt.compare(mdp, utilisateur.mdpHash);
    if (!mdpOk) {
      repondre(res, 401, { error: "Email ou mot de passe incorrect" });
      return;
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
    repondre(res, 200, { token, email });
    return;
  }

  // GET /devis/history — historique des devis (JWT requis)
  if (req.method === "GET" && req.url === "/devis/history") {
    const authHeader = req.headers["authorization"] ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      repondre(res, 401, { error: "Token manquant" });
      return;
    }
    let payload: { email: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { email: string };
    } catch {
      repondre(res, 401, { error: "Token invalide ou expiré" });
      return;
    }
    const devis = await lireDevisUtilisateur(payload.email);
    repondre(res, 200, { devis });
    return;
  }

  repondre(res, 404, { error: "Route inconnue. Disponible : POST /devis, POST /devis-test, GET /health, POST /auth/register, POST /auth/login, GET /devis/history" });
});

serveur.listen(PORT, () => {
  console.log(`Moteur de devis NeoTravel en écoute → http://localhost:${PORT}`);
  console.log(`  POST /devis    — calculer un devis`);
  console.log(`  GET  /health   — vérification santé`);
});
