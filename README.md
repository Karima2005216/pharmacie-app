# PharmaGest 💊

> Application de gestion de pharmacie développée avec Angular 17+
> Projet réalisé dans le cadre du module **Développement Web**

---

## 📋 Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- **Node.js** version 18 ou supérieure → [nodejs.org](https://nodejs.org)
- **Angular CLI** : 
```bash
npm install -g @angular/cli
```
- **json-server** :
```bash
npm install -g json-server
```

---

## ⚙️ Installation

Clonez le dépôt puis installez les dépendances :

```bash
git clone https://github.com/votre-username/pharmacie-app.git
cd pharmacie-app
npm install
```

---

## 🚀 Lancer le projet

Le projet nécessite **deux terminaux** ouverts simultanément :

### Terminal 1 — Backend (json-server)
```bash
NPX json-server --watch db.json --port 3000
```

### Terminal 2 — Frontend (Angular)
```bash
ng serve --open
```

---

## 🌐 Accès

| Service | URL |
|---|---|
| Application | http://localhost:4200 |
| API REST | http://localhost:3000 |

### Compte de test
| Champ | Valeur |
|---|---|
| Email | admin@pharmacie.ma |
| Mot de passe | admin123 |

---

## 🛠️ Technologies utilisées

| Technologie | Version | Usage |
|---|---|---|
| Angular | 17+ | Framework principal |
| TypeScript | 5+ | Langage de développement |
| Angular Material | 17+ | Composants UI |
| Angular Signals | 17+ | Gestion d'état réactive |
| json-server | — | API REST simulée |
| CSS | — | Styles et responsive design |

---

## ✨ Fonctionnalités

- 💊 **Gestion des médicaments** — CRUD complet avec alertes stock et expirations
- 👥 **Gestion des clients** — CRUD avec recherche
- 🏭 **Gestion des fournisseurs** — CRUD avec recherche
- 🧾 **Gestion des ventes** — Enregistrement et suivi
- 🖨️ **Ordonnances imprimables** — Génération et impression
- 🔍 **Recherche globale** — Recherche dans toutes les entités
- 🌍 **Internationalisation** — Français / Arabe / Anglais
- 🌙 **Mode sombre** — Toggle dark/light mode
- 📤 **Export CSV** — Médicaments et ventes
- 🔐 **Authentification** — Login/Logout avec guard
- 📊 **Dashboard** — KPIs, alertes, graphiques, top médicaments

---

## 📁 Structure du projet

```
pharmacie-app/
├── db.json                          ← Base de données json-server
├── README.md
├── package.json
├── angular.json
└── src/
    └── app/
        ├── app.ts                   ← Composant racine
        ├── app.routes.ts            ← Configuration des routes
        ├── app.config.ts            ← Configuration de l'application
        │
        ├── components/
        │   ├── dashboard/
        │   │   ├── dashboard.ts     ← Tableau de bord principal
        │   │   └── charts/
        │   │       └── charts.ts    ← Graphiques et statistiques
        │   │
        │   ├── medicaments/
        │   │   ├── medicament-list/
        │   │   │   └── medicament-list.ts   ← Liste avec filtres et pagination
        │   │   ├── medicament-form/
        │   │   │   └── medicament-form.ts   ← Création / Modification
        │   │   └── medicament-detail/
        │   │       └── medicament-detail.ts ← Détail d'un médicament
        │   │
        │   ├── clients/
        │   │   ├── client-list/
        │   │   │   └── client-list.ts       ← Liste des clients
        │   │   └── client-form/
        │   │       └── client-form.ts       ← Création / Modification
        │   │
        │   ├── fournisseurs/
        │   │   ├── fournisseur-list/
        │   │   │   └── fournisseur-list.ts  ← Liste des fournisseurs
        │   │   └── fournisseur-form/
        │   │       └── fournisseur-form.ts  ← Création / Modification
        │   │
        │   ├── ventes/
        │   │   ├── vente-list/
        │   │   │   └── vente-list.ts        ← Liste des ventes
        │   │   ├── vente-form/
        │   │   │   └── vente-form.ts        ← Nouvelle vente
        │   │   └── ordonnance/
        │   │       └── ordonnance.ts        ← Ordonnance imprimable
        │   │
        │   ├── recherche/
        │   │   └── recherche.ts             ← Recherche globale
        │   │
        │   ├── parametres/
        │   │   └── parametres.ts            ← Paramètres du compte
        │   │
        │   ├── login/
        │   │   └── login.ts                 ← Page de connexion
        │   │
        │   ├── navbar/
        │   │   └── navbar.ts                ← Sidebar + sélecteur langue
        │   │
        │   ├── layout/
        │   │   └── layout.ts                ← Layout principal
        │   │
        │   └── shared/
        │       ├── confirm-dialog/
        │       │   └── confirm-dialog.ts    ← Dialogue de confirmation
        │       └── toast/
        │           └── toast.ts             ← Notifications toast
        │
        ├── core/
        │   ├── models/
        │   │   ├── medicament.ts            ← Interface Medicament
        │   │   ├── client.ts                ← Interface Client
        │   │   ├── fournisseur.ts           ← Interface Fournisseur
        │   │   ├── vente.ts                 ← Interface Vente
        │   │   └── user.model.ts            ← Interface User
        │   │
        │   └── services/
        │       ├── auth.service.ts          ← Authentification (signal, computed, effect)
        │       ├── medicament.ts            ← CRUD médicaments + alertes computed
        │       ├── client.ts                ← CRUD clients
        │       ├── fournisseur.ts           ← CRUD fournisseurs
        │       ├── vente.ts                 ← CRUD ventes
        │       ├── langue.ts                ← Internationalisation FR/AR/EN
        │       ├── theme.ts                 ← Dark/Light mode
        │       ├── export.ts                ← Export CSV
        │       ├── notification.ts          ← Notifications toast
        │       └── confirm.ts               ← Dialogue de confirmation
        │
        ├── guards/
        │   └── auth.guard.ts               ← Protection des routes
        │
        └── pipes/
            ├── date-format-pipe.ts         ← Formatage des dates multilingue
            ├── expiration.pipe.ts          ← Statut d'expiration
            └── stock-status-pipe.ts        ← Statut du stock
```

## 🏗️ Build de production

```bash
ng build --configuration production
```

Les fichiers compilés seront dans le dossier `dist/`.

---

## 👥 Auteur

- **[EL HAJJAOUI KARIMA]** — [kar.elhajjaoui@edu.umi.ac.ma]

---

## 🎓 Informations académiques

| Champ | Détail |
|---|---|
| Établissement | École Normale Supérieure de Meknès |
| Module | Développement Web |
| Enseignant | Pr. ABDELLAOUI |
| Année universitaire | 2025-2026 |