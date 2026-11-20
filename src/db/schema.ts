import Dexie, { type EntityTable } from 'dexie';

export interface Candidature {
  id?: number;
  titre: string;
  entreprise: string;
  url: string;
  lieu: string;
  salaire_min: number | null;
  salaire_max: number | null;
  statut: StatutCandidature;
  date_candidature: string;
  spontanee: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type StatutCandidature = 'draft' | 'envoye' | 'relance' | 'entretien' | 'accepte' | 'refuse';

export interface Entretien {
  id?: number;
  candidature_id: number;
  date: string;
  type: TypeEntretien;
  notes: string;
  note: number | null;
}

export type TypeEntretien = 'telephonique' | 'video' | 'technique' | 'terrain' | 'rh' | 'autre';

export interface PlusMoins {
  id?: number;
  candidature_id: number;
  type: 'pour' | 'contre';
  contenu: string;
}

export interface Task {
  id?: number;
  titre: string;
  description: string;
  echeance: string | null;
  candidature_id: number | null;
  statut: 'a_faire' | 'faite';
  categorie: CategorieTask;
  created_at: string;
}

export type CategorieTask = 'entretien' | 'candidature' | 'relance' | 'recherche' | 'autre';

export const STATUTS: { value: StatutCandidature; label: string; color: string }[] = [
  { value: 'draft', label: 'Brouillon', color: 'bg-gray-400' },
  { value: 'envoye', label: 'Envoyé', color: 'bg-blue-500' },
  { value: 'relance', label: 'Relancé', color: 'bg-orange-500' },
  { value: 'entretien', label: 'En entretien', color: 'bg-violet-500' },
  { value: 'accepte', label: 'Accepté', color: 'bg-green-600' },
  { value: 'refuse', label: 'Refusé', color: 'bg-red-500' },
];

export const CATEGORIES_TASK: { value: CategorieTask; label: string }[] = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'candidature', label: 'Candidature' },
  { value: 'relance', label: 'Relance' },
  { value: 'recherche', label: 'Recherche' },
  { value: 'autre', label: 'Autre' },
];

export const TYPES_ENTRETIEN: { value: TypeEntretien; label: string }[] = [
  { value: 'telephonique', label: 'Téléphonique' },
  { value: 'video', label: 'Vidéo' },
  { value: 'technique', label: 'Technique' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'rh', label: 'RH' },
  { value: 'autre', label: 'Autre' },
];

export function typeEntretienLabel(type: TypeEntretien): string {
  return TYPES_ENTRETIEN.find(t => t.value === type)?.label ?? type;
}

export function categorieTaskLabel(categorie: CategorieTask): string {
  return CATEGORIES_TASK.find(c => c.value === categorie)?.label ?? categorie;
}

const db = new Dexie('EmploiDesFourmis') as Dexie & {
  candidatures: EntityTable<Candidature, 'id'>;
  entretiens: EntityTable<Entretien, 'id'>;
  plusmoins: EntityTable<PlusMoins, 'id'>;
  tasks: EntityTable<Task, 'id'>;
};

db.version(1).stores({
  candidatures: '++id, statut, date_candidature, entreprise',
  entretiens: '++id, candidature_id, date',
  plusmoins: '++id, candidature_id, type',
  tasks: '++id, statut, categorie, echeance',
});

// v2: index created_at on tasks (useTasks sorts by it; orderBy needs an index).
// Never edit an existing version — new indexes go in a bumped version.
db.version(2).stores({
  tasks: '++id, statut, categorie, echeance, created_at',
});

export { db };