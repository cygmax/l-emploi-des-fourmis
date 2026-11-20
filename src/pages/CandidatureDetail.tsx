import { useParams, useNavigate, Link } from 'react-router-dom';
import { STATUTS, typeEntretienLabel, type StatutCandidature, type TypeEntretien } from '../db/schema';
import { useCandidatures, useEntretiens, usePlusMoins, addEntretien, deleteEntretien, addPlusMoins, deletePlusMoins, updateStatut } from '../hooks/useCandidatures';
import { formatDate, formatDateTime, formatRelative } from '../utils/dates';
import StatutBadge from '../components/StatutBadge';
import PlusMoinsCard from '../components/PlusMoinsCard';
import EntretienForm from '../components/EntretienForm';
import { ArrowLeft, ExternalLink, MapPin, Euro, Calendar, Trash2, Edit3, Save, X } from 'lucide-react';
import { useState } from 'react';

const CandidatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidatureId = Number(id);
  const { candidatures, update, remove } = useCandidatures();
  const entretiens = useEntretiens(candidatureId);
  const plusmoinsList = usePlusMoins(candidatureId);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [newPlus, setNewPlus] = useState('');
  const [newMoins, setNewMoins] = useState('');

  const candidature = candidatures?.find(c => c.id === candidatureId);

  if (!candidature) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p className="font-medium">Candidature introuvable</p>
        <Link to="/candidatures" className="text-green-700 text-sm hover:underline mt-2 inline-block">
          ← Retour aux candidatures
        </Link>
      </div>
    );
  }

  const handleSaveNotes = async () => {
    await update(candidatureId, { notes: notesValue });
    setEditingNotes(false);
  };

  const handleAddEntretien = async (data: { date: string; type: TypeEntretien; notes: string; note: number | null }) => {
    await addEntretien({
      candidature_id: candidatureId,
      ...data,
    });
  };

  const handleAddPlus = async () => {
    if (!newPlus.trim()) return;
    await addPlusMoins({ candidature_id: candidatureId, type: 'pour', contenu: newPlus.trim() });
    setNewPlus('');
  };

  const handleAddMoins = async () => {
    if (!newMoins.trim()) return;
    await addPlusMoins({ candidature_id: candidatureId, type: 'contre', contenu: newMoins.trim() });
    setNewMoins('');
  };

  const handleStatutChange = async (statut: StatutCandidature) => {
    await updateStatut(candidatureId, statut);
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette candidature ? Ses entretiens et points +/- seront aussi supprimés.')) return;
    await remove(candidatureId);
    navigate('/candidatures');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/candidatures" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-green-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-bold text-stone-800">{candidature.titre}</h2>
            <p className="text-stone-500 mt-0.5">{candidature.entreprise}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatutBadge statut={candidature.statut} />
            <button
              onClick={handleDelete}
              aria-label="Supprimer la candidature"
              title="Supprimer la candidature"
              className="text-stone-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statut changer */}
        <div className="mb-4">
          <label htmlFor="candidature-statut" className="text-xs text-stone-500 block mb-1">Changer le statut</label>
          <select
            id="candidature-statut"
            value={candidature.statut}
            onChange={e => handleStatutChange(e.target.value as StatutCandidature)}
            className="text-sm px-3 py-1.5 border border-green-300 rounded-lg bg-white"
          >
            {STATUTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(candidature.date_candidature)}</span>
          {candidature.lieu && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {candidature.lieu}</span>}
          {candidature.salaire_min && (
            <span className="flex items-center gap-1"><Euro className="w-4 h-4" /> {candidature.salaire_min}k{candidature.salaire_max ? ` – ${candidature.salaire_max}k` : ''}</span>
          )}
          {candidature.spontanee && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Candidature spontanée</span>}
        </div>

        {candidature.url && (
          <a
            href={candidature.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 mt-3"
          >
            <ExternalLink className="w-4 h-4" /> Voir l'offre originale
          </a>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-stone-700">Notes</h3>
          {!editingNotes && (
            <button onClick={() => { setNotesValue(candidature.notes); setEditingNotes(true); }} className="text-stone-400 hover:text-green-700">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              aria-label="Notes"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveNotes} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><Save className="w-4 h-4" /> Enregistrer</button>
              <button onClick={() => setEditingNotes(false)} className="flex items-center gap-1 text-stone-500 px-3 py-1.5 rounded-lg text-sm hover:bg-stone-100"><X className="w-4 h-4" /> Annuler</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600 whitespace-pre-wrap">{candidature.notes || 'Aucune note.'}</p>
        )}
      </div>

      {/* Pour / Contre */}
      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3">Mes + et −</h3>

        <div className="space-y-2 mb-4">
          {plusmoinsList && plusmoinsList.length > 0 ? (
            plusmoinsList.map(pm => (
              <PlusMoinsCard key={pm.id} type={pm.type} contenu={pm.contenu} onDelete={() => { if (pm.id) deletePlusMoins(pm.id); }} />
            ))
          ) : (
            <p className="text-sm text-stone-400">Ajoute des points positifs et négatifs.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex gap-2">
            <input
              value={newPlus}
              onChange={e => setNewPlus(e.target.value)}
              aria-label="Point positif"
              placeholder="Un point positif..."
              className="flex-1 px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              onKeyDown={e => e.key === 'Enter' && handleAddPlus()}
            />
            <button onClick={handleAddPlus} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600">+</button>
          </div>
          <div className="flex gap-2">
            <input
              value={newMoins}
              onChange={e => setNewMoins(e.target.value)}
              aria-label="Point négatif"
              placeholder="Un point négatif..."
              className="flex-1 px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              onKeyDown={e => e.key === 'Enter' && handleAddMoins()}
            />
            <button onClick={handleAddMoins} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">−</button>
          </div>
        </div>
      </div>

      {/* Entretiens */}
      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
        <h3 className="font-semibold text-stone-700 mb-3">Entretiens</h3>

        {entretiens && entretiens.length > 0 && (
          <div className="space-y-2 mb-4">
            {entretiens.map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <div className="text-center min-w-10">
                  <p className="text-lg font-bold text-violet-700">{e.note ?? '—'}</p>
                  <p className="text-[10px] text-violet-500">/5</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{typeEntretienLabel(e.type)}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500 text-xs">{formatDateTime(e.date)}</span>
                    <span className="text-stone-400 text-xs">({formatRelative(e.date)})</span>
                  </div>
                  {e.notes && <p className="text-xs text-stone-600 mt-1">{e.notes}</p>}
                </div>
                {e.id && (
                  <button onClick={() => deleteEntretien(e.id!)} aria-label="Supprimer l'entretien" className="text-stone-400 hover:text-red-500 text-sm shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <EntretienForm onSubmit={handleAddEntretien} />
      </div>
    </div>
  );
};

export default CandidatureDetail;