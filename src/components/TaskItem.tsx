import { useState } from 'react';
import { type Task, categorieTaskLabel } from '../db/schema';
import { formatDate } from '../utils/dates';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete }) => {
  // Read the clock once per mount: Date is impure during render.
  const [now] = useState(() => new Date());
  const isOverdue = task.echeance && new Date(task.echeance) < now && task.statut === 'a_faire';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      task.statut === 'faite' ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-green-200'
    }`}>
      <input
        type="checkbox"
        checked={task.statut === 'faite'}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded border-green-300 text-green-700 focus:ring-emerald-500"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.statut === 'faite' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
          {task.titre}
        </p>
        {task.description && (
          <p className="text-xs text-stone-500 mt-0.5 truncate">{task.description}</p>
        )}
        {task.echeance && (
          <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
            {isOverdue ? '⚠️ ' : ''}{formatDate(task.echeance)}
          </p>
        )}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
        {categorieTaskLabel(task.categorie)}
      </span>
      <button onClick={onDelete} aria-label="Supprimer la tâche" className="text-stone-400 hover:text-red-500 shrink-0 text-sm">✕</button>
    </div>
  );
};

export default TaskItem;