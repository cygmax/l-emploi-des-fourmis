import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidatures } from '../hooks/useCandidatures';
import { STATUTS, type StatutCandidature } from '../db/schema';
import { scrapeUrl } from '../utils/scrape';
import { todayISO } from '../utils/dates';
import { Link, Search, Globe, Loader2 } from 'lucide-react';

const AjoutRapide: React.FC = () => {
  const navigate = useNavigate();
  const { add } = useCandidatures();

  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const [titre, setTitre] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [lieu, setLieu] = useState('');
  const [salaireMin, setSalaireMin] = useState('');
  const [salaireMax, setSalaireMax] = useState('');
  const [statut, setStatut] = useState<StatutCandidature>('envoye');
  const [dateCandidature, setDateCandidature] = useState(todayISO());
  const [spontanee, setSpontanee] = useState(false);
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'url' | 'manuel'>('url');

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setScrapeError('');
    try {
      const result = await scrapeUrl(url.trim());
      if (result.success) {
        setTitre(result.data.titre);
        setEntreprise(result.data.entreprise);
        setMode('manuel');
      } else {
        setScrapeError(result.error || 'Impossible de préremplir depuis cette URL.');
      }
    } catch {
      setScrapeError('Erreur lors de la récupération.');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    const id = await add({
      titre: titre.trim(),
      entreprise: entreprise.trim(),
      url: url.trim(),
      lieu: lieu.trim(),
      salaire_min: salaireMin ? Number(salaireMin) : null,
      salaire_max: salaireMax ? Number(salaireMax) : null,
      statut,
      date_candidature: dateCandidature,
      spontanee,
      notes,
    });

    navigate(`/candidature/${id}`);
  };

  const resetForm = () => {
    setTitre('');
    setEntreprise('');
    setLieu('');
    setSalaireMin('');
    setSalaireMax('');
    setStatut('envoye');
    setDateCandidature(todayISO());
    setSpontanee(false);
    setNotes('');
    setUrl('');
    setScrapeError('');
    setMode('url');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-stone-800">Ajouter une candidature</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url' ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200'
          }`}
        >
          <Link className="w-4 h-4" /> Coller une URL
        </button>
        <button
          onClick={() => setMode('manuel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'manuel' ? 'bg-green-600 text-white' : 'bg-white text-stone-600 border border-green-200'
          }`}
        >
          <Globe className="w-4 h-4" /> Remplir manuellement
        </button>
      </div>

      {mode === 'url' && (
        <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
          <p className="text-sm text-stone-600 mb-3">
            Colle le lien de l'offre (LinkedIn, Welcome to the Jungle, Indeed…) et je tente de préremplir la fiche.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              id="cand-url"
              aria-label="URL de l'offre"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/..."
              className="flex-1 px-4 py-2.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              onKeyDown={e => e.key === 'Enter' && handleScrape()}
            />
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {scraping ? 'Recherche…' : 'Préremplir'}
            </button>
          </div>
          {scrapeError && <p className="text-xs text-red-500 mt-2">{scrapeError}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm space-y-4">
        <h3 className="font-semibold text-stone-700">Fiche de poste</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="cand-titre" className="block text-sm text-stone-600 mb-1">Intitulé du poste *</label>
            <input
              id="cand-titre"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Ex : Développeur Frontend React"
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="cand-entreprise" className="block text-sm text-stone-600 mb-1">Entreprise</label>
            <input
              id="cand-entreprise"
              value={entreprise}
              onChange={e => setEntreprise(e.target.value)}
              placeholder="Nom de l'entreprise"
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="cand-lieu" className="block text-sm text-stone-600 mb-1">Lieu</label>
            <input
              id="cand-lieu"
              value={lieu}
              onChange={e => setLieu(e.target.value)}
              placeholder="Paris, Lyon, Télétravail..."
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="cand-salaire-min" className="block text-sm text-stone-600 mb-1">Salaire min (k€)</label>
            <input
              id="cand-salaire-min"
              type="number"
              value={salaireMin}
              onChange={e => setSalaireMin(e.target.value)}
              placeholder="45"
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="cand-salaire-max" className="block text-sm text-stone-600 mb-1">Salaire max (k€)</label>
            <input
              id="cand-salaire-max"
              type="number"
              value={salaireMax}
              onChange={e => setSalaireMax(e.target.value)}
              placeholder="55"
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="cand-date" className="block text-sm text-stone-600 mb-1">Date de candidature</label>
            <input
              id="cand-date"
              type="date"
              value={dateCandidature}
              onChange={e => setDateCandidature(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="cand-statut" className="block text-sm text-stone-600 mb-1">Statut</label>
            <select
              id="cand-statut"
              value={statut}
              onChange={e => setStatut(e.target.value as StatutCandidature)}
              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {STATUTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="spontanee"
            checked={spontanee}
            onChange={e => setSpontanee(e.target.checked)}
            className="w-4 h-4 rounded border-green-300 text-green-700 focus:ring-emerald-500"
          />
          <label htmlFor="spontanee" className="text-sm text-stone-600">Candidature spontanée</label>
        </div>

        <div>
          <label htmlFor="cand-notes" className="block text-sm text-stone-600 mb-1">Notes</label>
          <textarea
            id="cand-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Pourquoi ce poste t'intéresse, contact, remarques..."
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Enregistrer la candidature
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjoutRapide;