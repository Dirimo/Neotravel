# NeoTravel Pricing — Moteur de devis autocar

Système automatisé de génération de devis pour transferts en autocar.

## Architecture générale

```
Client (chat)
    ↓
Agent IA (n8n)          ← collecte les infos, pose les questions
    ↓
Moteur de devis (Node.js) ← calcule le prix selon les règles tarifaires
    ↓
Base de données (Airtable) ← stocke les demandes et les devis
```

---

## Étape 1 — Moteur de calcul ✅

**Fichiers :** `src/calculer_devis.ts` · `src/calculer_devis.test.ts`

Le moteur calcule automatiquement un prix de transfert en autocar à partir de 4 paramètres :
- Distance en km
- Nombre de passagers
- Type de transfert (simple ou aller-retour)
- Date de départ

### Règles tarifaires (source : PDF officiel NeoTravel)

**Grille forfait — 18 paliers**

| Distance | Prix HT |
|---|---|
| ≤ 10 km | 250 € |
| ≤ 20 km | 250 € |
| ≤ 30 km | 250 € |
| ≤ 40 km | 320 € |
| ≤ 50 km | 350 € |
| ≤ 60 km | 390 € |
| ≤ 70 km | 430 € |
| ≤ 80 km | 500 € |
| ≤ 90 km | 540 € |
| ≤ 100 km | 580 € |
| ≤ 110 km | 620 € |
| ≤ 120 km | 660 € |
| ≤ 130 km | 700 € |
| ≤ 140 km | 740 € |
| ≤ 150 km | 780 € |
| ≤ 160 km | 820 € |
| ≤ 170 km | 860 € |
| ≤ 180 km | 900 € |
| > 180 km | distance × 2 × 2,5 € |

**Aller-retour** = prix simple × 2

**Coefficients saisonnalité**

| Mois | Niveau | Coefficient |
|---|---|---|
| Novembre, Janvier, Février, Août | Basse saison | × 0,93 (−7 %) |
| Septembre, Octobre, Décembre | Saison moyenne | × 1,00 |
| Mars, Avril, Juillet | Haute saison | × 1,10 (+10 %) |
| Mai, Juin | Très haute saison | × 1,15 (+15 %) |

**Coefficients délai (entre date de demande et date de départ)**

| Délai | Code | Coefficient |
|---|---|---|
| ≤ 14 jours | DD_PRIORITAIRE | × 1,10 (+10 %) |
| 15 à 30 jours | DD_URGENT | × 1,05 (+5 %) |
| 31 à 90 jours | DD_NORMAL | × 0,95 (−5 %) |
| > 90 jours | DD_3MOISETPLUS | × 0,90 (−10 %) |

**Coefficients capacité**

| Passagers | Coefficient |
|---|---|
| ≤ 19 | × 0,95 (−5 %) |
| 20 à 53 | × 1,00 |
| 54 à 63 | × 1,15 (+15 %) |
| 64 à 67 | × 1,20 (+20 %) |
| 68 à 85 | × 1,40 (+40 %) |
| > 85 | → cas complexe (traitement manuel) |

**Marge et TVA**
- Marge commerciale : +15 %
- TVA : 10 %

### Tests

27 tests Vitest couvrant tous les paliers et cas limites du PDF.

```bash
npm test
```

---

## Étape 2 — Base de données Airtable ✅


**Fichier :** `scripts/setup-airtable.ts`

Base Airtable (`appceCt3bnungfohx`) avec 6 tables :

| Table | Rôle |
|---|---|
| Clients | Coordonnées des clients |
| Demandes | Demandes de devis reçues |
| Devis | Devis générés avec prix |
| Relances | Suivi des relances commerciales |
| Matrices | Coefficients (saison, délai, capacité) |
| Grille_Tarifs | 18 paliers de prix par distance |

### Configuration requise

Fichier `.env` à la racine :

```
AIRTABLE_PAT=patXXXXXXXX...
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
PORT=3000
```

Le token Airtable (PAT) nécessite 4 permissions :
- `data.records:read`
- `data.records:write`
- `schema.bases:read`
- `schema.bases:write`

### Initialisation de la base

```bash
npm run setup:airtable
```

Ce script crée les tables et insère les données tarifaires (idempotent — peut être relancé sans risque).

---

## Étape 3 — Agent IA n8n (en cours) ⏳

**Fichiers :** `n8n/workflow.json` · `n8n/system-prompt.txt`

### Prérequis

- n8n installé (`npm install -g n8n`)
- Une clé API d'un modèle IA (Vercel AI Gateway, OpenAI, Anthropic, Google Gemini...)

### Lancer les services

Terminal 1 — serveur NeoTravel :
```bash
npm run dev
```

Terminal 2 — n8n :
```bash
n8n start
```
Puis ouvrir **http://localhost:5678**

### Importer le workflow

Dans n8n → menu → **Import from file** → sélectionner `n8n/workflow.json`

Le workflow contient :
- **Chat Trigger** — point d'entrée du chat
- **AI Agent** — orchestre la conversation (prompt système dans `n8n/system-prompt.txt`)
- **Language Model** — le modèle IA (à configurer selon ton fournisseur)
- **Window Buffer Memory** — mémoire de session (10 derniers messages)
- **Tool calculer_devis** — appelle `POST /localhost:3000/devis` pour calculer le prix

### Endpoints HTTP disponibles

| Route | Description |
|---|---|
| `POST /devis` | Calcul réel selon les règles tarifaires |
| `POST /devis-test` | Prix fixe pour tester le flux n8n sans le vrai moteur |
| `GET /health` | Vérification santé du serveur |

### Comportement de l'agent

L'agent collecte les informations **une par une** dans l'ordre :
1. Distance en km
2. Nombre de passagers
3. Type (simple / aller-retour)
4. Date de départ

Puis appelle l'outil de calcul et présente le résultat. En cas de groupe > 85 passagers, il escalade vers un commercial humain.

---

## Commandes disponibles

```bash
npm test              # 27 tests Vitest
npm run dev           # Serveur HTTP port 3000
npm run setup:airtable  # Initialiser/réinitialiser la base Airtable
npm run build         # Compiler TypeScript
npm start             # Lancer la version compilée
```

## Stack technique

- **TypeScript** (strict mode) + **Node.js 22**
- **Vitest** pour les tests
- **Airtable** (API REST) pour la base de données
- **n8n** pour l'agent IA et l'automatisation
- **tsx** pour exécuter TypeScript directement
