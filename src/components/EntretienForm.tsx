import { useState } from 'react';
import { TYPES_ENTRETIEN, type TypeEntretien } from '../db/schema';

interface Props {
  onSubmit: (data: { date: string; type: TypeEntretien; notes: string; note: number | null }) => void;
}

const EntretienForm: React.FC<Props> = ({ onSubmit }) => {
  const [date, setDate] = useState('');
  const [type, setType] = useState<TypeEntretien>('video');
  const [notes, setNotes] = useState('');
  const [note, setNote] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    // Keep the datetime-local value as-is: storing the wall-clock the user
    // entered (not toISOString, which shifts the day/hour out of local time).
    onSubmit({ date, type, notes, note });
    setDate('');
    setNotes('');
    setNote(null);
    setType('video');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-green-50/50 p-4 rounded-lg border border-green-200">
      <h4 className="font-medium text-sm text-green-800">Nouvel entretien</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="entretien-date" className="block text-xs text-stone-500 mb-1">Date et heure</label>
          <input
            id="entretien-date"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            required
          />
        </div>
        <div>
          <label htmlFor="entretien-type" className="block text-xs text-stone-500 mb-1">Type</label>
          <select
            id="entretien-type"
            value={type}
            onChange={e => setType(e.target.value as TypeEntretien)}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {TYPES_ENTRETIEN.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="entretien-note" className="block text-xs text-stone-500 mb-1">Note /5</label>
          <select
            id="entretien-note"
            value={note ?? ''}
            onChange={e => setNote(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="entretien-notes" className="block text-xs text-stone-500 mb-1">Notes</label>
        <textarea
          id="entretien-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Ajouter
      </button>
    </form>
  );
};

export default EntretienForm;