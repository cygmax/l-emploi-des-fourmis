import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, typeEntretienLabel } from '../db/schema';
import { useTousEntretiens } from '../hooks/useCandidatures';
import { useTasks } from '../hooks/useTasks';
import { getMonthDays, addMonths, subMonths, isDatePast, isSameDayDate, formatTime } from '../utils/dates';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const JOURS_SEMAINE = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const Calendrier: React.FC = () => {
  // Read the clock once per mount: Date is impure during render.
  const [now] = useState(() => new Date());
  const [annee, setAnnee] = useState(() => now.getFullYear());
  const [mois, setMois] = useState(() => now.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const entretiens = useTousEntretiens();
  const { tasks } = useTasks();
  const candidatures = useLiveQuery(() => db.candidatures.toArray());

  const days = getMonthDays(annee, mois);
  const moisLabel = format(new Date(annee, mois), 'MMMM yyyy', { locale: fr });
  const todayStr = format(now, 'yyyy-MM-dd');

  const prevMonth = () => {
    const prev = subMonths(new Date(annee, mois), 1);
    setAnnee(prev.getFullYear());
    setMois(prev.getMonth());
  };

  const nextMonth = () => {
    const next = addMonths(new Date(annee, mois), 1);
    setAnnee(next.getFullYear());
    setMois(next.getMonth());
  };

  const eventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEntretiens = entretiens?.filter(e => e.date.startsWith(dayStr)) || [];
    const dayTasks = tasks?.filter(t => t.echeance === dayStr && t.statut === 'a_faire') || [];
    return { entretiens: dayEntretiens, tasks: dayTasks };
  };

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-violet-500" />
        Calendrier
      </h2>

      <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-green-50">
          <button onClick={prevMonth} className="p-1 hover:bg-green-200 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h3 className="text-lg font-semibold capitalize text-stone-700">{moisLabel}</h3>
          <button onClick={nextMonth} className="p-1 hover:bg-green-200 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-green-100">
          {JOURS_SEMAINE.map(j => (
            <div key={j} className="text-center text-xs text-stone-500 py-2 font-medium">{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square p-1" />;

            const dayStr = format(day, 'yyyy-MM-dd');
            const isToday = dayStr === todayStr;
            const isSelected = selectedDay && isSameDayDate(day.toISOString(), selectedDay.toISOString());
            const events = eventsForDay(day);
            const hasEvents = events.entretiens.length > 0 || events.tasks.length > 0;

            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square p-1 relative flex flex-col items-center justify-center text-sm transition-colors hover:bg-green-50 ${
                  isSelected ? 'bg-green-100 ring-2 ring-emerald-500 rounded-lg' : ''
                }`}
              >
                <span className={`font-medium ${isToday ? 'bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-stone-700'}`}>
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {events.entretiens.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                    {events.tasks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </div>
                )}
                {isDatePast(day.toISOString()) && !isToday && (
                  <span className="absolute inset-0 bg-stone-50/30 rounded-lg pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedEvents && (
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <h3 className="font-semibold text-stone-700 mb-3">
            {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
          </h3>

          {selectedEvents.entretiens.length === 0 && selectedEvents.tasks.length === 0 && (
            <p className="text-sm text-stone-400">Rien de prévu ce jour-là.</p>
          )}

          {selectedEvents.entretiens.map(e => {
            const cand = candidatures?.find(c => c.id === e.candidature_id);
            return (
              <Link
                key={e.id}
                to={`/candidature/${e.candidature_id}`}
                className="flex items-center gap-3 p-3 mb-2 bg-violet-50 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{cand?.entreprise || '—'} — {typeEntretienLabel(e.type)}</p>
                  <p className="text-xs text-stone-500">{formatTime(e.date)}</p>
                </div>
              </Link>
            );
          })}

          {selectedEvents.tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 mb-2 bg-green-50 rounded-lg border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm">{t.titre}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Entretien</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Tâche</span>
      </div>
    </div>
  );
};

export default Calendrier;