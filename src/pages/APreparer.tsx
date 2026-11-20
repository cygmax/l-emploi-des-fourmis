import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTousEntretiens } from '../hooks/useCandidatures';
import { CATEGORIES_TASK, type CategorieTask } from '../db/schema';
import TaskItem from '../components/TaskItem';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { formatRelative } from '../utils/dates';
import { Plus, Calendar, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const APreparer: React.FC = () => {
  const { tasks, add, toggle, remove } = useTasks();
  const entretiens = useTousEntretiens();
  const candidatures = useLiveQuery(() => db.candidatures.toArray());

  const [filtreCategorie, setFiltreCategorie] = useState<CategorieTask | 'toutes'>('toutes');
  const [showForm, setShowForm] = useState(false);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [echeance, setEcheance] = useState('');
  const [categorie, setCategorie] = useState<CategorieTask>('autre');
  const [candidatureId, setCandidatureId] = useState<number | null>(null);

  // Read the clock once per mount: Date is impure during render.
  const [maintenant] = useState(() => new Date());

  if (!tasks || !entretiens) {
    return <div className="text-center py-12 text-stone-500">Chargement…</div>;
  }

  const filteredTasks = tasks.filter(
    t => filtreCategorie === 'toutes' || t.categorie === filtreCategorie
  );

  const aFaire = filteredTasks.filter(t => t.statut === 'a_faire');
  const faites = filteredTasks.filter(t => t.statut === 'faite');

  const entretiensAVenir = entretiens
    .filter(e => new Date(e.date) > maintenant)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    await add({
      titre: titre.trim(),
      description,
      echeance: echeance || null,
      candidature_id: candidatureId,
      statut: 'a_faire',
      categorie,
    });
    setTitre('');
    setDescription('');
    setEcheance('');
    setCategorie('autre');
    setCandidatureId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-green-500" />
          À préparer
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 border border-green-200 shadow-sm space-y-3">
          <h3 className="font-semibold text-stone-700 text-sm">Nouvelle tâche</h3>
          <div>
            <label htmlFor="tache-titre" className="sr-only">Titre de la tâche</label>
            <input
              id="tache-titre"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Titre de la tâche *"
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="tache-description" className="sr-only">Description</label>
            <textarea
              id="tache-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="tache-echeance" className="block text-xs text-stone-500 mb-1">Échéance</label>
              <input
                id="tache-echeance"
                type="date"
                value={echeance}
                onChange={e => setEcheance(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div>
              <label htmlFor="tache-categorie" className="block text-xs text-stone-500 mb-1">Catégorie</label>
              <select
                id="tache-categorie"
                value={categorie}
                onChange={e => setCategorie(e.target.value as CategorieTask)}
                className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORIES_TASK.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tache-candidature" className="block text-xs text-stone-500 mb-1">Liée à</label>
              <select
                id="tache-candidature"
                value={candidatureId ?? ''}
                onChange={e => setCandidatureId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">— Aucune —</option>
                {candidatures?.map(c => (
                  <option key={c.id} value={c.id}>{c.entreprise} — {c.titre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-stone-500 px-4 py-2 text-sm hover:bg-stone-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-500" />
          Entretiens à venir
        </h3>
        {entretiensAVenir.length === 0 ? (
          <p className="text-sm text-stone-400">Aucun entretien programmé.</p>
        ) : (
          <div className="space-y-2">
            {entretiensAVenir.map(e => {
              const cand = candidatures?.find(c => c.id === e.candidature_id);
              return (
                <Link
                  key={e.id}
                  to={`/candidature/${e.candidature_id}`}
                  className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors text-sm"
                >
                  <div>
                    <span className="font-medium">{cand?.entreprise || '—'}</span>
                    <span className="text-stone-500 ml-2">— {e.type}</span>
                  </div>
                  <span className="text-stone-500">{formatRelative(e.date)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFiltreCategorie('toutes')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            filtreCategorie === 'toutes' ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200'
          }`}
        >
          Toutes
        </button>
        {CATEGORIES_TASK.map(c => (
          <button
            key={c.value}
            onClick={() => setFiltreCategorie(c.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
              filtreCategorie === c.value ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-stone-700 mb-2 text-sm">À faire ({aFaire.length})</h3>
        {aFaire.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">Rien à faire, tranquille ! 🎉</p>
        ) : (
          <div className="space-y-2">
            {aFaire.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={() => t.id && toggle(t.id)}
                onDelete={() => t.id && remove(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      {faites.length > 0 && (
        <div>
          <h3 className="font-semibold text-stone-500 mb-2 text-sm">Faites ({faites.length})</h3>
          <div className="space-y-2">
            {faites.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={() => t.id && toggle(t.id)}
                onDelete={() => t.id && remove(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default APreparer;