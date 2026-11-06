import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRoom, saveRoomState, subscribeToRoom, type GameRoom } from '@/lib/rooms';
import type { RoomState } from '@/types/game';

export type RoomStatus = 'loading' | 'ready' | 'missing' | 'error';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [status, setStatus] = useState<RoomStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);
  const roomRef = useRef<GameRoom | null>(null);

  const applyRoom = useCallback((next: GameRoom) => {
    roomRef.current = next;
    setRoom(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = subscribeToRoom(roomId, applyRoom);

    setStatus('loading');
    fetchRoom(roomId)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          applyRoom(result);
          setStatus('ready');
        } else {
          setStatus('missing');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [roomId, applyRoom]);

  const updateState = useCallback(
    async (change: (state: RoomState) => RoomState) => {
      const current = roomRef.current;
      if (!current) return;

      const nextState = change(current.state);
      applyRoom({ ...current, state: nextState });
      setActionError(null);

      try {
        await saveRoomState(current.id, nextState);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Something went wrong.');
        const fresh = await fetchRoom(current.id).catch(() => null);
        if (fresh) applyRoom(fresh);
      }
    },
    [applyRoom],
  );

  return { room, status, actionError, updateState };
}
