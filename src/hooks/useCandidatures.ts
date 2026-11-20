import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Candidature, type Entretien, type PlusMoins, type StatutCandidature } from '../db/schema';

export function useCandidatures() {
  const candidatures = useLiveQuery(() =>
    db.candidatures.orderBy('date_candidature').reverse().toArray()
  );

  const getById = (id: number) =>
    db.candidatures.get(id);

  const add = async (data: Omit<Candidature, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    return db.candidatures.add({ ...data, created_at: now, updated_at: now });
  };

  const update = async (id: number, data: Partial<Candidature>) => {
    await db.candidatures.update(id, { ...data, updated_at: new Date().toISOString() });
  };

  const remove = async (id: number) => {
    await db.candidatures.delete(id);
    await db.entretiens.where('candidature_id').equals(id).delete();
    await db.plusmoins.where('candidature_id').equals(id).delete();
  };

  return { candidatures, getById, add, update, remove };
}

export function useEntretiens(candidatureId: number | null): Entretien[] | undefined {
  return useLiveQuery(
    () => candidatureId === null ? Promise.resolve([] as Entretien[]) : db.entretiens.where('candidature_id').equals(candidatureId).sortBy('date'),
    [candidatureId]
  );
}

export function useTousEntretiens() {
  return useLiveQuery(() => db.entretiens.orderBy('date').toArray());
}

export function usePlusMoins(candidatureId: number | null): PlusMoins[] | undefined {
  return useLiveQuery(
    () => candidatureId === null ? Promise.resolve([] as PlusMoins[]) : db.plusmoins.where('candidature_id').equals(candidatureId).toArray(),
    [candidatureId]
  );
}

export async function addEntretien(data: Omit<Entretien, 'id'>) {
  return db.entretiens.add(data);
}

export async function deleteEntretien(id: number) {
  return db.entretiens.delete(id);
}

export async function addPlusMoins(data: Omit<PlusMoins, 'id'>) {
  return db.plusmoins.add(data);
}

export async function deletePlusMoins(id: number) {
  return db.plusmoins.delete(id);
}

export async function updateStatut(id: number, statut: StatutCandidature) {
  await db.candidatures.update(id, { statut, updated_at: new Date().toISOString() });
}