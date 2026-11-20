import { db, type Candidature, type Entretien, type PlusMoins, type Task } from './schema';

const APP_ID = 'emploi-des-fourmis';
const BACKUP_VERSION = 1;

interface BackupFile {
  app: string;
  version: number;
  exported_at: string;
  data: {
    candidatures: Candidature[];
    entretiens: Entretien[];
    plusmoins: PlusMoins[];
    tasks: Task[];
  };
}

async function buildBackup(): Promise<BackupFile> {
  const [candidatures, entretiens, plusmoins, tasks] = await Promise.all([
    db.candidatures.toArray(),
    db.entretiens.toArray(),
    db.plusmoins.toArray(),
    db.tasks.toArray(),
  ]);
  return {
    app: APP_ID,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    data: { candidatures, entretiens, plusmoins, tasks },
  };
}

// Download the whole database as a JSON file.
export async function exportBackup(): Promise<void> {
  const backup = await buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${APP_ID}-${backup.exported_at.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isValidBackup(parsed: unknown): parsed is BackupFile {
  if (typeof parsed !== 'object' || parsed === null) return false;
  const data = (parsed as BackupFile).data;
  return (
    typeof data === 'object' && data !== null &&
    Array.isArray(data.candidatures) &&
    Array.isArray(data.entretiens) &&
    Array.isArray(data.plusmoins) &&
    Array.isArray(data.tasks)
  );
}

// Replace the whole database with the content of a backup file.
// Ids are kept as-is so candidature_id links survive the round-trip.
export async function importBackup(file: File): Promise<void> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!isValidBackup(parsed)) {
    throw new Error('Fichier de sauvegarde invalide.');
  }

  await db.transaction(
    'rw',
    [db.candidatures, db.entretiens, db.plusmoins, db.tasks],
    async () => {
      await Promise.all([
        db.candidatures.clear(),
        db.entretiens.clear(),
        db.plusmoins.clear(),
        db.tasks.clear(),
      ]);
      await db.candidatures.bulkAdd(parsed.data.candidatures);
      await db.entretiens.bulkAdd(parsed.data.entretiens);
      await db.plusmoins.bulkAdd(parsed.data.plusmoins);
      await db.tasks.bulkAdd(parsed.data.tasks);
    }
  );
}
