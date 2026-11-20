import { type StatutCandidature, STATUTS } from '../db/schema';

interface Props {
  statut: StatutCandidature;
}

const StatutBadge: React.FC<Props> = ({ statut }) => {
  const config = STATUTS.find(s => s.value === statut);
  if (!config) return null;

  const colors: Record<StatutCandidature, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    envoye: 'bg-blue-50 text-blue-700 border-blue-300',
    relance: 'bg-orange-50 text-orange-700 border-orange-300',
    entretien: 'bg-violet-50 text-violet-700 border-violet-300',
    accepte: 'bg-green-50 text-green-700 border-green-300',
    refuse: 'bg-red-50 text-red-700 border-red-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[statut]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.color}`} />
      {config.label}
    </span>
  );
};

export default StatutBadge;