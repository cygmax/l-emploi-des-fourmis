import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidatures } from '../hooks/useCandidatures';
import { STATUTS, type StatutCandidature } from '../db/schema';
import StatutBadge from '../components/StatutBadge';
import { Plus, ArrowUpRight, Briefcase, MapPin, Euro } from 'lucide-react';
import { formatDate } from '../utils/dates';

const Candidatures: React.FC = () => {
  const { candidatures } = useCandidatures();
  const [filtre, setFiltre] = useState<StatutCandidature | 'tous'>('tous');
  const [tri, setTri] = useState<'recent' | 'ancien'>('recent');

  if (!candidatures) {
    return <div className="text-center py-12 text-stone-500">Chargement…</div>;
  }

  const filtrees = candidatures
    .filter(c => filtre === 'tous' || c.statut === filtre)
    .sort((a, b) => {
      const diff = new Date(a.date_candidature).getTime() - new Date(b.date_candidature).getTime();
      return tri === 'recent' ? -diff : diff;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-800">Mes candidatures</h2>
        <Link
          to="/ajout"
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFiltre('tous')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filtre === 'tous' ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200 hover:bg-green-50'
          }`}
        >
          Tous ({candidatures.length})
        </button>
        {STATUTS.map(s => {
          const count = candidatures.filter(c => c.statut === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setFiltre(s.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtre === s.value ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200 hover:bg-green-50'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex justify-end">
        <select
          value={tri}
          onChange={e => setTri(e.target.value as 'recent' | 'ancien')}
          className="text-xs px-2 py-1 border border-green-200 rounded-lg bg-white text-stone-600"
        >
          <option value="recent">Plus récent</option>
          <option value="ancien">Plus ancien</option>
        </select>
      </div>

      {/* List */}
      {filtrees.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Aucune candidature</p>
          <Link to="/ajout" className="text-green-700 text-sm hover:underline mt-1 inline-block">
            Ajouter la première →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrees.map(c => (
            <Link
              key={c.id}
              to={`/candidature/${c.id}`}
              className="block bg-white rounded-xl p-4 border border-green-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800 truncate">{c.titre}</h3>
                    {c.spontanee && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">
                        Spontanée
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500">{c.entreprise}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-stone-400">
                    {c.lieu && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.lieu}
                      </span>
                    )}
                    {c.salaire_min && (
                      <span className="flex items-center gap-1">
                        <Euro className="w-3 h-3" /> {c.salaire_min}k{c.salaire_max ? ` – ${c.salaire_max}k` : ''}
                      </span>
                    )}
                    <span>{formatDate(c.date_candidature)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatutBadge statut={c.statut} />
                  <ArrowUpRight className="w-4 h-4 text-stone-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidatures;