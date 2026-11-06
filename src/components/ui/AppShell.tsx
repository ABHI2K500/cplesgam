import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-royal-50 via-white to-royal-100 font-sans text-royal-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-royal-200/60 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-royal-300/40 blur-3xl animate-float [animation-delay:-3s]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
