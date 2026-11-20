# 🐜 L'Emploi des Fourmis

> Suis tes candidatures comme une fourmi travailleuse.

Une application web pour suivre toutes tes candidatures, entretiens et tâches liées à la recherche d'emploi — le tout en local, sans serveur.

## ✨ Fonctionnalités

- **📋 Tableau de bord** — Vue d'ensemble de tes candidatures, prochains entretiens, tâches urgentes
- **📂 Gestion des candidatures** — Liste filtrée et triable par statut
- **🔍 Détail d'une candidature** — Fiche complète avec notes, entretiens, points +/-, changement de statut
- **➕ Ajout rapide** — Colle une URL d'offre (LinkedIn, Welcome to the Jungle, Indeed) pour préremplir la fiche
- **📅 Calendrier** — Vue mensuelle des entretiens et échéances
- **✅ À préparer** — Todo list avec catégories et liage aux candidatures

## 🚀 Pour commencer

```bash
# Installer les dépendances
bun install

# Lancer l'application
bun dev
```

Puis ouvre [http://localhost:5173](http://localhost:5173).

## 🛠️ Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Dexie.js (IndexedDB)
- React Router v7
- date-fns
- Lucide React

## 📦 Construction

```bash
bun run build
```

Les fichiers de production sont dans `dist/`. Tu peux les servir avec n'importe quel serveur statique.

## 📱 Sur ton téléphone

L'app fonctionne 100 % hors ligne, données comprises (IndexedDB). Pour l'utiliser sur mobile indépendamment du PC :

1. Crée un repo GitHub (nom sans accents ni apostrophe, ex. `lemploi-des-fourmis`) et pousse le code.
2. Dans le repo : **Settings → Pages → Source : GitHub Actions**.
3. Chaque push sur `main` déploie automatiquement (workflow `.github/workflows/deploy.yml`) vers `https://<user>.github.io/<repo>/`.
4. Sur le téléphone, ouvre l'URL puis **« Ajouter à l'écran d'accueil »** : l'app se lance en plein écran, hors ligne, avec sa propre base de données.

Notes importantes :

- **Ton téléphone et ton PC ne partagent pas les données** — l'app est locale par design. Utilise Exporter/Importer (tableau de bord) pour transférer une sauvegarde JSON d'un appareil à l'autre.
- Sur iOS, Safari purge le stockage des sites non utilisés pendant 7 jours — **installe l'app sur l'écran d'accueil** et exporte tes données régulièrement.
- Le build PWA (manifest + service worker) est activé via `VITE_PWA=true` — le workflow le fait automatiquement. Le build local n'inclut pas la PWA si le chemin du projet contient une apostrophe (`workbox-build` ne l'échappe pas).

## 🐜 À propos

Créé avec ❤️ pour les chercheur·euses d'emploi qui veulent garder le contrôle.