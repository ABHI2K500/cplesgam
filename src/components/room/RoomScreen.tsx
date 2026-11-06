import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import DareWheelGame from '@/components/games/DareWheelGame';
import SoundChallengeGame from '@/components/games/SoundChallengeGame';
import TruthOrDareGame from '@/components/games/TruthOrDareGame';
import GameMenu from '@/components/room/GameMenu';
import RoomHeader from '@/components/room/RoomHeader';
import WaitingForPartner from '@/components/room/WaitingForPartner';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import { useRoom } from '@/hooks/useRoom';
import type { GameId, RoomPlayer, RoomState } from '@/types/game';

interface RoomScreenProps {
  roomId: string;
  player: RoomPlayer;
  onLeave: () => void;
}

export default function RoomScreen({ roomId, player, onLeave }: RoomScreenProps) {
  const { room, status, actionError, updateState } = useRoom(roomId);

  if (status === 'loading') {
    return (
      <StatusScreen>
        <Loader2 className="h-8 w-8 animate-spin text-royal-600" aria-label="Loading room" />
      </StatusScreen>
    );
  }

  if (status === 'missing' || status === 'error' || !room) {
    const message =
      status === 'missing' ? 'We could not find this room. It may have been removed.' : 'We could not load this room.';
    return (
      <StatusScreen>
        <p className="text-lg text-royal-900">{message}</p>
        <Button onClick={onLeave}>Back to the start</Button>
      </StatusScreen>
    );
  }

  const { state } = room;
  const isMember = state.players.some((existing) => existing.id === player.id);
  if (!isMember) {
    return (
      <StatusScreen>
        <p className="text-lg text-royal-900">You are no longer part of this room.</p>
        <Button onClick={onLeave}>Back to the start</Button>
      </StatusScreen>
    );
  }

  const partner = state.players.find((existing) => existing.id !== player.id) ?? null;

  const setActiveGame = (game: GameId) => updateState((current) => ({ ...current, activeGame: game }));

  return (
    <AppShell>
      <RoomHeader code={room.code} players={state.players} meId={player.id} onLeave={onLeave} />
      {actionError && (
        <div className="mx-auto mt-6 max-w-5xl px-6">
          <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {actionError}
          </p>
        </div>
      )}
      {partner ? (
        <GameArea
          state={state}
          me={player}
          partner={partner}
          onUpdate={updateState}
          onSelectGame={setActiveGame}
        />
      ) : (
        <WaitingForPartner code={room.code} />
      )}
    </AppShell>
  );
}

interface GameAreaProps {
  state: RoomState;
  me: RoomPlayer;
  partner: RoomPlayer;
  onUpdate: (change: (state: RoomState) => RoomState) => Promise<void>;
  onSelectGame: (game: GameId) => Promise<void>;
}

function GameArea({ state, me, partner, onUpdate, onSelectGame }: GameAreaProps) {
  const gameProps = {
    state,
    me,
    partner,
    onUpdate,
    onBack: () => void onSelectGame('hub'),
  };

  switch (state.activeGame) {
    case 'truth':
      return <TruthOrDareGame {...gameProps} />;
    case 'wheel':
      return <DareWheelGame {...gameProps} />;
    case 'sound':
      return <SoundChallengeGame {...gameProps} />;
    case 'hub':
      return <GameMenu onSelect={(game) => void onSelectGame(game)} />;
  }
}

function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">{children}</div>
    </AppShell>
  );
}
