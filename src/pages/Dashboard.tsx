import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { exportBackup, importBackup } from '../db/backup';
import { Briefcase, CheckCircle, XCircle, Calendar, ArrowUpRight, Download, Upload, HardDrive } from 'lucide-react';
import { formatDate, format } from '../utils/dates';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const candidatures = useLiveQuery(() => db.candidatures.toArray());
  const entretiens = useLiveQuery(() => db.entretiens.orderBy('date').toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());

  // Read the clock once per mount: Date is impure during render.
  const [maintenant] = useState(() => new Date());
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      await exportBackup();
    } catch {
      setMessage("Échec de l'export.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm("Importer ce fichier remplacera TOUTES les données actuelles. Continuer ?")) return;
    try {
      await importBackup(file);
      setMessage('Sauvegarde importée.');
    } catch (err) {
      setMessage(err instanceof Error ? `Import échoué : ${err.message}` : 'Import échoué.');
    }
  };

  if (!candidatures || !entretiens || !tasks) {
    return <div className="text-center py-12 text-stone-500">Chargement…</div>;
  }

  const stats = {
    total: candidatures.length,
    enCours: candidatures.filter(c => c.statut === 'envoye' || c.statut === 'relance').length,
    entretien: candidatures.filter(c => c.statut === 'entretien').length,
    acceptees: candidatures.filter(c => c.statut === 'accepte').length,
    refusees: candidatures.filter(c => c.statut === 'refuse').length,
    draft: candidatures.filter(c => c.statut === 'draft').length,
  };

  // toISOString would give the UTC day, wrong around local midnight.
  const aujourdHui = format(maintenant, 'yyyy-MM-dd');

  const prochainsEntretiens = entretiens
    .filter(e => new Date(e.date) >= maintenant)
    .slice(0, 3);

  const tasksDuJour = tasks.filter(
    t => t.statut === 'a_faire' && t.echeance && t.echeance <= aujourdHui
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">Tableau de bord</h2>
        <span className="text-sm text-stone-500">{formatDate(aujourdHui)}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">En cours</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.enCours + stats.entretien}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Entretiens</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.entretien}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Acceptées</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.acceptees}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Refusées</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.refusees}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-500" />
          Prochains entretiens
        </h3>
        {prochainsEntretiens.length === 0 ? (
          <p className="text-sm text-stone-400">Aucun entretien à venir</p>
        ) : (
          <div className="space-y-2">
            {prochainsEntretiens.map(e => {
              const cand = candidatures.find(c => c.id === e.candidature_id);
              return (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{cand?.entreprise || '—'}</span>
                    <span className="text-stone-400 ml-2">{formatDate(e.date)}</span>
                  </div>
                  <Link to={`/candidature/${e.candidature_id}`} className="text-green-700 hover:text-green-800">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          ⚡ Tâches urgentes
        </h3>
        {tasksDuJour.length === 0 ? (
          <p className="text-sm text-stone-400">Rien d'urgent aujourd'hui ! 🎉</p>
        ) : (
          <div className="space-y-2">
            {tasksDuJour.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>{t.titre}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3">Vue d'ensemble</h3>
        {stats.total > 0 ? (
          <div className="space-y-2">
            {([
              { label: 'Acceptées', count: stats.acceptees, color: 'bg-green-500' },
              { label: 'En entretien', count: stats.entretien, color: 'bg-violet-500' },
              { label: 'En cours', count: stats.enCours, color: 'bg-blue-500' },
              { label: 'Brouillons', count: stats.draft, color: 'bg-gray-400' },
              { label: 'Refusées', count: stats.refusees, color: 'bg-red-500' },
            ] as const).map(s => s.count > 0 && (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className="w-20 text-stone-600">{s.label}</span>
                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${(s.count / stats.total) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-stone-500">{s.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400">Ajoute ta première candidature !</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-stone-400" />
          Sauvegarde
        </h3>
        <p className="text-sm text-stone-500 mb-3">
          Tes données ne vivent que dans ce navigateur. Exporte-les régulièrement pour éviter toute perte.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <label className="flex items-center gap-1 text-stone-600 px-3 py-1.5 rounded-lg text-sm border border-green-300 hover:bg-green-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer
            <input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
          </label>
        </div>
        {message && <p className="text-xs text-stone-500 mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default Dashboard;