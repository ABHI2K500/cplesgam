import { useState } from 'react';
import LobbyScreen from '@/components/lobby/LobbyScreen';
import RoomScreen from '@/components/room/RoomScreen';
import { loadSession, saveSession, type StoredSession } from '@/lib/session';
import type { RoomPlayer } from '@/types/game';

function App() {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession());

  const enterRoom = (player: RoomPlayer, roomId: string) => {
    const next = { player, roomId };
    saveSession(next);
    setSession(next);
  };

  const leaveRoom = () => {
    if (!session) return;
    const next = { player: session.player, roomId: null };
    saveSession(next);
    setSession(next);
  };

  if (!session?.roomId) {
    return <LobbyScreen existingPlayer={session?.player ?? null} onEnterRoom={enterRoom} />;
  }

  return (
    <RoomScreen key={session.roomId} roomId={session.roomId} player={session.player} onLeave={leaveRoom} />
  );
}

export default App;
