import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { calculer_devis, type ParametresDevis, type TypeTransfert } from "./calculer_devis";
import { creerUtilisateur, trouverUtilisateur, lireDevisUtilisateur, creerDevis, lireTousLesDevis, mettreAJourStatutDevis } from "./airtable-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "neotravel_dev_secret";

const PORT = process.env["BACKEND_PORT"] != null ? parseInt(process.env["BACKEND_PORT"]) : 3001;
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "admin";

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
      repondre(res, 200, { type: "erreur_validation", code: "LECTURE_CORPS", message: "Impossible de lire le corps de la requête." });
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(corps) as Record<string, unknown>;
    } catch {
      repondre(res, 200, { type: "erreur_validation", code: "JSON_INVALIDE", message: "Corps JSON invalide." });
      return;
    }

    const typeTransfert = body["typeTransfert"];
    if (!validerTypeTransfert(typeTransfert)) {
      repondre(res, 200, {
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
      repondre(res, 200, {
        type: "erreur_validation",
        code: "CHAMPS_MANQUANTS",
        message: "Champs requis : distanceKm (number), nombrePassagers (number), typeTransfert, dateDepart (ISO).",
      });
      return;
    }

    const resultat = calculer_devis(params);
    const statut = 200; // Toujours renvoyer 200 pour que le chatbot (n8n) puisse lire l'erreur sans crasher

    if (resultat.type === "prix") {
      let userEmail = body["userEmail"] as string | undefined;
      const auth = (req.headers["authorization"] ?? "") as string;
      if (!userEmail && auth.startsWith("Bearer ")) {
        try {
          const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { email: string };
          userEmail = payload.email;
        } catch { /* non connecté, on continue */ }
      }
      const now = new Date();
      const validite = new Date(now);
      validite.setDate(validite.getDate() + 3);
      creerDevis({
        dateCreation: now,
        dateValidite: validite,
        prixHT: resultat.prixHT,
        tva: resultat.tva,
        prixTTC: resultat.prixTTC,
        detailJson: JSON.stringify(resultat.details),
        typeResultat: "prix",
        statut: "Envoyé",
        ...(userEmail ? { userEmail } : {}),
      }).catch((e: unknown) => console.error("Erreur sauvegarde Airtable:", e));
    }

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
    try {
      const devis = await lireDevisUtilisateur(payload.email);
      repondre(res, 200, { devis });
    } catch (err) {
      console.error("Erreur lireDevisUtilisateur:", err);
      repondre(res, 500, { error: "Erreur lors de la récupération des devis" });
    }
    return;
  }

  // GET /debug/champs — affiche les vrais noms de champs Airtable
  if (req.method === "GET" && req.url === "/debug/champs") {
    try {
      const r = await fetch(
        `https://api.airtable.com/v0/${process.env["AIRTABLE_BASE_ID"]}/Devis?maxRecords=1`,
        { headers: { Authorization: `Bearer ${process.env["AIRTABLE_PAT"]}` } }
      );
      const data = await r.json() as { records?: Array<{ fields: Record<string, unknown> }> };
      const champs = data.records?.[0] ? Object.keys(data.records[0].fields) : ["(aucun enregistrement)"];
      repondre(res, 200, { champs });
    } catch (e) {
      repondre(res, 500, { error: String(e) });
    }
    return;
  }

  // POST /distance — calculer la distance (déplacé de Nuxt pour éviter l'erreur 426 de Vite)
  if (req.method === "POST" && req.url === "/distance") {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(await lireCorps(req)) as Record<string, unknown>;
    } catch {
      repondre(res, 400, { error: "JSON invalide" });
      return;
    }
    const villeDepart = String(body.villeDepart || '');
    const villeArrivee = String(body.villeArrivee || '');

    if (!villeDepart || !villeArrivee) {
      repondre(res, 200, { distanceKm: 100 });
      return;
    }

    try {
      const getCoords = async (city: string) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', France')}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'NeoTravel/1.0' } });
        const data = await res.json() as Array<{ lat: string; lon: string }>;
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        return null;
      };

      const coords1 = await getCoords(villeDepart);
      const coords2 = await getCoords(villeArrivee);

      if (coords1 && coords2) {
        const R = 6371;
        const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
        const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        repondre(res, 200, { distanceKm: Math.max(1, Math.round(distance * 1.3)) });
        return;
      }
    } catch (e) {
      console.error("Erreur géocodage:", e);
    }

    repondre(res, 200, { distanceKm: 500 });
    return;
  }

  // POST /auth/admin-login — connexion admin
  if (req.method === "POST" && req.url === "/auth/admin-login") {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(await lireCorps(req)) as Record<string, unknown>;
    } catch {
      repondre(res, 400, { error: "JSON invalide" });
      return;
    }
    const { mdp } = body as Record<string, string>;
    if (mdp !== ADMIN_PASSWORD) {
      repondre(res, 401, { error: "Mot de passe administrateur incorrect" });
      return;
    }
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    repondre(res, 200, { token });
    return;
  }

  // GET /admin/devis — historique complet des devis pour admin
  if (req.method === "GET" && req.url === "/admin/devis") {
    const authHeader = req.headers["authorization"] ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      repondre(res, 401, { error: "Token manquant" });
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
      if (payload.role !== "admin") {
        repondre(res, 403, { error: "Accès refusé" });
        return;
      }
      const devis = await lireTousLesDevis();
      repondre(res, 200, { devis });
    } catch (err) {
      console.error("Erreur lireTousLesDevis:", err);
      repondre(res, 500, { error: "Erreur lors de la récupération des devis" });
    }
    return;
  }

  // PATCH /admin/devis — changer le statut d'un devis
  if (req.method === "PATCH" && req.url === "/admin/devis") {
    const authHeader = req.headers["authorization"] ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      repondre(res, 401, { error: "Token manquant" });
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
      if (payload.role !== "admin") {
        repondre(res, 403, { error: "Accès refusé" });
        return;
      }
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(await lireCorps(req)) as Record<string, unknown>;
      } catch {
        repondre(res, 400, { error: "JSON invalide" });
        return;
      }
      const { id, statut } = body as { id: string; statut: any };
      if (!id || !statut) {
        repondre(res, 400, { error: "Champs requis : id, statut" });
        return;
      }
      await mettreAJourStatutDevis(id, statut);
      repondre(res, 200, { success: true });
    } catch (err) {
      console.error("Erreur mettreAJourStatutDevis:", err);
      repondre(res, 500, { error: "Erreur lors de la mise à jour du statut" });
    }
    return;
  }

  repondre(res, 404, { error: "Route inconnue. Disponible : POST /devis, POST /devis-test, GET /health, POST /auth/register, POST /auth/login, GET /devis/history, POST /auth/admin-login, GET /admin/devis, PATCH /admin/devis" });
});

serveur.listen(PORT, () => {
  console.log(`Moteur de devis NeoTravel en écoute → http://localhost:${PORT}`);
  console.log(`  POST /devis    — calculer un devis`);
  console.log(`  GET  /health   — vérification santé`);
});
