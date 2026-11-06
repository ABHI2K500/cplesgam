import { useState } from 'react';
import { Check, Copy, Hourglass } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WaitingForPartnerProps {
  code: string;
}

export default function WaitingForPartner({ code }: WaitingForPartnerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center animate-fade-up">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-lg shadow-royal-600/30">
        <Hourglass className="h-7 w-7 animate-pulse" aria-hidden />
      </span>
      <h2 className="mt-8 font-display text-4xl font-bold text-royal-900">Waiting for your partner</h2>
      <p className="mt-4 text-lg leading-relaxed text-royal-800/80">
        Share this code with your partner. The games unlock the moment they join.
      </p>

      <div className="mt-10 w-full rounded-3xl bg-white p-8 shadow-royal ring-1 ring-royal-100 animate-pop-in">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-royal-700/70">Room code</p>
        <p className="mt-3 font-display text-5xl font-bold tracking-[0.3em] text-royal-700">{code}</p>
        <Button onClick={handleCopy} variant="secondary" className="mt-8 w-full">
          {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? 'Copied to clipboard' : 'Copy code'}
        </Button>
      </div>
    </section>
  );
}
