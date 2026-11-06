import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  DEFAULT_WHEEL_DARES,
  MAX_DARE_LENGTH,
  MAX_WHEEL_DARES,
  MIN_WHEEL_DARES,
} from '@/data/prompts';

interface EditDaresModalProps {
  dares: string[];
  onSave: (dares: string[]) => void;
  onClose: () => void;
}

export default function EditDaresModal({ dares, onSave, onClose }: EditDaresModalProps) {
  const [draft, setDraft] = useState<string[]>(() => [...dares]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const updateDare = (index: number, value: string) => {
    setDraft((current) => current.map((dare, position) => (position === index ? value : dare)));
  };

  const removeDare = (index: number) => {
    setDraft((current) => current.filter((_, position) => position !== index));
  };

  const addDare = () => {
    setDraft((current) => [...current, '']);
  };

  const handleSave = () => {
    const cleaned = draft.map((dare) => dare.trim()).filter((dare) => dare.length > 0);
    if (cleaned.length < MIN_WHEEL_DARES) {
      setError(`Add at least ${MIN_WHEEL_DARES} dares so the wheel has something to spin.`);
      return;
    }
    if (cleaned.some((dare) => dare.length > MAX_DARE_LENGTH)) {
      setError(`Keep each dare under ${MAX_DARE_LENGTH} characters.`);
      return;
    }
    onSave(cleaned);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/50 p-4 backdrop-blur-sm animate-fade-up"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-dares-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-royal animate-pop-in"
      >
        <div className="flex items-start justify-between gap-4 border-b border-royal-100 p-6">
          <div>
            <h3 id="edit-dares-title" className="font-display text-2xl font-bold text-royal-900">
              Edit your dares
            </h3>
            <p className="mt-1 text-sm text-royal-800/75">
              Each dare becomes one slice of the wheel. Both of you see changes right away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-royal-700 transition hover:bg-royal-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-300"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {draft.map((dare, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-7 shrink-0 text-center text-sm font-semibold text-royal-700">{index + 1}</span>
              <input
                value={dare}
                onChange={(event) => updateDare(index, event.target.value)}
                maxLength={MAX_DARE_LENGTH}
                placeholder="Write a dare"
                aria-label={`Dare ${index + 1}`}
                className="min-w-0 flex-1 rounded-2xl border border-royal-200 bg-royal-50/50 px-4 py-3 text-sm text-royal-950 placeholder:text-royal-800/40 transition focus:border-royal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal-100"
              />
              <button
                type="button"
                onClick={() => removeDare(index)}
                aria-label={`Remove dare ${index + 1}`}
                className="rounded-full p-2 text-royal-700 transition hover:bg-royal-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-300"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}

          <Button
            variant="secondary"
            onClick={addDare}
            disabled={draft.length >= MAX_WHEEL_DARES}
            className="w-full"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add a dare ({draft.length}/{MAX_WHEEL_DARES})
          </Button>

          {error && (
            <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-royal-100 p-6">
          <Button variant="ghost" onClick={() => setDraft([...DEFAULT_WHEEL_DARES])}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset to defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save dares</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
