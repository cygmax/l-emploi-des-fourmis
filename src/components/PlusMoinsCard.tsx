interface Props {
  type: 'pour' | 'contre';
  contenu: string;
  onDelete: () => void;
}

const PlusMoinsCard: React.FC<Props> = ({ type, contenu, onDelete }) => {
  const isPour = type === 'pour';
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${
      isPour ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <span className="text-lg mt-0.5">{isPour ? '👍' : '👎'}</span>
      <p className="flex-1 text-sm text-stone-700">{contenu}</p>
      <button
        onClick={onDelete}
        aria-label="Supprimer"
        className="text-stone-400 hover:text-red-500 transition-colors text-sm"
      >
        ✕
      </button>
    </div>
  );
};

export default PlusMoinsCard;