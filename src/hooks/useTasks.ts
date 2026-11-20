import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '../db/schema';

export function useTasks() {
  const tasks = useLiveQuery(() =>
    db.tasks.orderBy('created_at').reverse().toArray()
  );

  const add = async (data: Omit<Task, 'id' | 'created_at'>) => {
    return db.tasks.add({ ...data, created_at: new Date().toISOString() });
  };

  const toggle = async (id: number) => {
    const task = await db.tasks.get(id);
    if (task) {
      await db.tasks.update(id, { statut: task.statut === 'a_faire' ? 'faite' : 'a_faire' });
    }
  };

  const remove = async (id: number) => {
    await db.tasks.delete(id);
  };

  const update = async (id: number, data: Partial<Task>) => {
    await db.tasks.update(id, data);
  };

  return { tasks, add, toggle, remove, update };
}