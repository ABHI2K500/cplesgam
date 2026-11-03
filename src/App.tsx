import { useEffect, useState } from 'react';
import { Heart, Users, LogIn, Sparkles, Flame, Eye, RotateCw, X, Check, Crown, Play, Copy, ChevronRight, Zap } from 'lucide-react';
import {
  GameRoom,
  SpiceLevel,
  PlayerSlot,
  createRoom,
  joinRoom,
  startGame,
  updateRoom,
  subscribeToRoom,
  recordUsedCard,
  getUsedCardIds,
  clearUsedCards,
} from '@/lib/supabase';
import { getRandomCard, CHALLENGE_META, CardContent, CARD_CONTENT } from '@/lib/cards';

type Screen = 'home' | 'lobby' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [mySlot, setMySlot] = useState<PlayerSlot>('player1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!room) return;
    const unsub = subscribeToRoom(room.id, (updated) => {
      setRoom(updated);
      if (updated.status === 'playing') {
        setScreen('game');
      } else if (updated.status === 'finished') {
        setScreen('game');
      } else if (updated.status === 'lobby') {
        setScreen('lobby');
      }
    });
    return unsub;
  }, [room?.id]);

  const myName = room ? (mySlot === 'player1' ? room.player1_name : room.player2_name ?? '') : '';
  const partnerName = room ? (mySlot === 'player1' ? room.player2_name : room.player1_name) : '';
  const isMyTurn = room ? room.current_turn === mySlot : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a14] via-[#0f0610] to-[#0a0510] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-rose-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-pink-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] w-[250px] h-[250px] bg-fuchsia-700/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center">
        {screen === 'home' && (
          <HomeScreen
            onCreated={(r, slot) => {
              setRoom(r);
              setMySlot(slot);
              setScreen('lobby');
            }}
            onJoined={(r, slot) => {
              setRoom(r);
              setMySlot(slot);
              setScreen('lobby');
            }}
            error={error}
            setError={setError}
          />
        )}
        {screen === 'lobby' && room && (
          <LobbyScreen
            room={room}
            mySlot={mySlot}
            myName={myName}
            partnerName={partnerName}
            onStart={(spice) => handleStart(room, spice, mySlot)}
            onLeave={() => {
              setRoom(null);
              setScreen('home');
            }}
          />
        )}
        {screen === 'game' && room && (
          <GameScreen
            room={room}
            mySlot={mySlot}
            myName={myName}
            partnerName={partnerName}
            isMyTurn={isMyTurn}
            onDrawCard={(card) => handleDrawCard(room, mySlot, card)}
            onComplete={(card, completed) => handleComplete(room, mySlot, card, completed)}
            onNextRound={(nextPlayer) => handleNextTurn(room, nextPlayer)}
            onEndGame={() => handleEndGame(room)}
            onLeave={() => {
              setRoom(null);
              setScreen('home');
            }}
          />
        )}
      </div>
    </div>
  );

  async function handleStart(room: GameRoom, spice: SpiceLevel, slot: PlayerSlot) {
    try {
      const starting: PlayerSlot = slot;
      await startGame(room.id, spice, starting);
      await clearUsedCards(room.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start game');
    }
  }

  async function handleDrawCard(room: GameRoom, slot: PlayerSlot, card: CardContent) {
    await updateRoom(room.id, { current_challenge: card.challenge });
    await recordUsedCard(room.id, card.id, slot, false);
  }

  async function handleComplete(room: GameRoom, slot: PlayerSlot, card: CardContent, completed: boolean) {
    const myScore = slot === 'player1' ? room.player1_score + (completed ? 2 : 0) : room.player1_score;
    const partnerScore = slot === 'player2' ? room.player2_score + (completed ? 2 : 0) : room.player2_score;
    const nextPlayer: PlayerSlot = slot === 'player1' ? 'player2' : 'player1';
    await updateRoom(room.id, {
      current_challenge: null,
      current_turn: nextPlayer,
      round: room.round + 1,
      player1_score: myScore,
      player2_score: partnerScore,
    });
    await recordUsedCard(room.id, card.id, slot, completed);
  }

  async function handleNextTurn(room: GameRoom, nextPlayer: PlayerSlot) {
    await updateRoom(room.id, { current_turn: nextPlayer, current_challenge: null });
  }

  async function handleEndGame(room: GameRoom) {
    await updateRoom(room.id, { status: 'finished', current_challenge: null });
  }
}

// ============================= HOME SCREEN =============================

function HomeScreen({
  onCreated,
  onJoined,
  error,
  setError,
}: {
  onCreated: (room: GameRoom, slot: PlayerSlot) => void;
  onJoined: (room: GameRoom, slot: PlayerSlot) => void;
  error: string;
  setError: (e: string) => void;
}) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await createRoom(name.trim());
      onCreated(room, 'player1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (joinCode.trim().length < 6) {
      setError('Enter the 6-character room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await joinRoom(joinCode.trim(), name.trim());
      onJoined(room, 'player2');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-12 flex flex-col items-center min-h-screen justify-center">
      <div className="mb-12 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 mb-6 shadow-lg shadow-rose-500/40">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200 bg-clip-text text-transparent">
          Spicy Nights
        </h1>
        <p className="text-rose-200/60 mt-3 text-lg">A daring game for two</p>
        <div className="flex items-center gap-2 mt-4 justify-center text-rose-300/50 text-sm">
          <Users className="w-4 h-4" />
          <span>2 players · 2 devices · 1 unforgettable night</span>
        </div>
      </div>

      {error && (
        <div className="w-full mb-6 bg-red-950/60 border border-red-500/40 rounded-xl px-4 py-3 text-red-200 text-sm flex items-center gap-2 animate-slide-up">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === 'menu' && (
        <div className="w-full flex flex-col gap-4 animate-slide-up">
          <button
            onClick={() => { setMode('create'); setError(''); }}
            className="group w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-2xl py-5 px-6 font-semibold text-lg transition-all duration-300 shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 hover:scale-[1.02] flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <Heart className="w-5 h-5" fill="white" />
              Create a Room
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => { setMode('join'); setError(''); }}
            className="group w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/40 rounded-2xl py-5 px-6 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-rose-300" />
              Join with Code
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-rose-300" />
          </button>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Sparkles, label: 'Truths' },
              { icon: Flame, label: 'Dares' },
              { icon: Eye, label: 'Reveals' },
            ].map((f) => (
              <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl py-4 px-2">
                <f.icon className="w-6 h-6 mx-auto mb-2 text-rose-300" />
                <p className="text-xs text-rose-100/60 font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="w-full flex flex-col gap-5 animate-slide-up">
          <div>
            <label className="text-rose-200/70 text-sm font-medium mb-2 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl py-4 font-semibold text-lg transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RotateCw className="w-5 h-5 animate-spin" /> Creating...</>
            ) : (
              <>Create Room <ChevronRight className="w-5 h-5" /></>
            )}
          </button>

          <button onClick={() => { setMode('menu'); setError(''); }} className="text-rose-200/50 hover:text-rose-200 text-sm py-2 transition-colors">
            Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="w-full flex flex-col gap-5 animate-slide-up">
          <div>
            <label className="text-rose-200/70 text-sm font-medium mb-2 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-rose-200/70 text-sm font-medium mb-2 block">Room Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="ABCDEF"
              className="w-full bg-white/5 border border-white/10 focus:border-rose-500/50 rounded-xl px-4 py-3.5 text-white text-center text-2xl tracking-[0.4em] font-bold placeholder-white/20 outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl py-4 font-semibold text-lg transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RotateCw className="w-5 h-5 animate-spin" /> Joining...</>
            ) : (
              <>Join Room <ChevronRight className="w-5 h-5" /></>
            )}
          </button>

          <button onClick={() => { setMode('menu'); setError(''); }} className="text-rose-200/50 hover:text-rose-200 text-sm py-2 transition-colors">
            Back
          </button>
        </div>
      )}
    </div>
  );
}

// ============================= LOBBY SCREEN =============================

function LobbyScreen({
  room,
  mySlot,
  myName,
  partnerName,
  onStart,
  onLeave,
}: {
  room: GameRoom;
  mySlot: PlayerSlot;
  myName: string;
  partnerName: string | null;
  onStart: (spice: SpiceLevel) => void;
  onLeave: () => void;
}) {
  const [spice, setSpice] = useState<SpiceLevel>(room.spice_level as SpiceLevel);
  const [copied, setCopied] = useState(false);
  const isHost = mySlot === 'player1';
  const bothJoined = !!room.player2_name;

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-md px-6 py-12 flex flex-col items-center min-h-screen justify-center">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 mb-4 shadow-lg shadow-rose-500/40 animate-pulse-slow">
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
        <h2 className="text-2xl font-bold text-rose-100">Waiting Room</h2>
      </div>

      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 animate-slide-up">
        <p className="text-rose-200/60 text-sm font-medium text-center mb-3">Share this code with your partner</p>
        <div className="relative">
          <div className="bg-gradient-to-r from-rose-950/80 to-pink-950/80 border border-rose-500/30 rounded-xl py-5 text-center text-4xl tracking-[0.5em] font-bold text-rose-100 select-none">
            {room.code}
          </div>
          <button
            onClick={copyCode}
            className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-rose-200" />}
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mb-6">
        <PlayerChip name={room.player1_name} status="ready" isYou={mySlot === 'player1'} />
        <PlayerChip name={partnerName} status={partnerName ? 'ready' : 'waiting'} isYou={mySlot === 'player2'} />
      </div>

      {isHost && (
        <div className="w-full mb-6 animate-slide-up">
          <p className="text-rose-200/60 text-sm font-medium mb-3 text-center">Choose your spice level</p>
          <div className="grid grid-cols-3 gap-3">
            <SpiceButton level="mild" selected={spice === 'mild'} onClick={() => setSpice('mild')} icon={Sparkles} label="Mild" />
            <SpiceButton level="medium" selected={spice === 'medium'} onClick={() => setSpice('medium')} icon={Flame} label="Medium" />
            <SpiceButton level="hot" selected={spice === 'hot'} onClick={() => setSpice('hot')} icon={Zap} label="Hot" />
          </div>
        </div>
      )}

      {!isHost && (
        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-6 text-center text-rose-200/60 text-sm">
          {bothJoined ? 'Waiting for host to start the game...' : 'Waiting for your partner to join...'}
          <div className="flex justify-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {isHost && bothJoined && (
        <button
          onClick={() => onStart(spice)}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-2xl py-5 font-bold text-lg transition-all shadow-lg shadow-rose-600/40 hover:shadow-rose-500/60 hover:scale-[1.02] flex items-center justify-center gap-3 animate-slide-up"
        >
          <Play className="w-5 h-5" fill="white" />
          Start Game
        </button>
      )}

      {isHost && !bothJoined && (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-rose-200/50 text-sm">
          Waiting for your partner to join...
          <div className="flex justify-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <button onClick={onLeave} className="mt-6 text-rose-200/50 hover:text-rose-200 text-sm py-2 transition-colors">
        Leave room
      </button>
    </div>
  );
}

function SpiceButton({ level, selected, onClick, icon: Icon, label }: { level: SpiceLevel; selected: boolean; onClick: () => void; icon: typeof Flame; label: string }) {
  const colors: Record<SpiceLevel, string> = {
    mild: 'from-emerald-600 to-teal-600 shadow-emerald-600/30',
    medium: 'from-orange-600 to-amber-600 shadow-orange-600/30',
    hot: 'from-red-600 to-rose-700 shadow-red-600/40',
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-300 ${
        selected
          ? `bg-gradient-to-b ${colors[level]} border-transparent shadow-lg scale-[1.05]`
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-rose-200/50'}`} />
      <span className={`text-sm font-semibold ${selected ? 'text-white' : 'text-rose-200/50'}`}>{label}</span>
    </button>
  );
}

function PlayerChip({ name, status, isYou }: { name: string | null; status: 'ready' | 'waiting'; isYou: boolean }) {
  return (
    <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 ${status === 'ready' ? 'opacity-100' : 'opacity-50'}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-rose-100 truncate">{name || 'Waiting for player...'}</p>
        <p className="text-xs text-rose-200/50">{isYou ? 'You' : status === 'ready' ? 'Ready' : 'Not joined'}</p>
      </div>
      {status === 'ready' ? (
        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
      ) : (
        <RotateCw className="w-5 h-5 text-rose-200/40 animate-spin flex-shrink-0" />
      )}
    </div>
  );
}

// ============================= GAME SCREEN =============================

function GameScreen({
  room,
  mySlot,
  myName,
  partnerName,
  isMyTurn,
  onDrawCard,
  onComplete,
  onNextRound,
  onEndGame,
  onLeave,
}: {
  room: GameRoom;
  mySlot: PlayerSlot;
  myName: string;
  partnerName: string | null;
  isMyTurn: boolean;
  onDrawCard: (card: CardContent) => void;
  onComplete: (card: CardContent, completed: boolean) => void;
  onNextRound: (nextPlayer: PlayerSlot) => void;
  onEndGame: () => void;
  onLeave: () => void;
}) {
  const [drawing, setDrawing] = useState(false);
  const [revealCard, setRevealCard] = useState(false);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    getUsedCardIds(room.id).then(setUsedIds);
  }, [room.id, room.round]);

  const myScore = mySlot === 'player1' ? room.player1_score : room.player2_score;
  const partnerScore = mySlot === 'player1' ? room.player2_score : room.player1_score;
  const currentCard = room.current_challenge;
  const spice = room.spice_level as SpiceLevel;
  const isFinished = room.status === 'finished';

  async function handleDraw() {
    if (!isMyTurn || currentCard || drawing) return;
    setDrawing(true);
    setRevealCard(false);
    const card = getRandomCard(spice, usedIds);
    if (!card) {
      // All cards used — reset
      await clearUsedCards(room.id);
      setUsedIds([]);
      const freshCard = getRandomCard(spice, []);
      if (freshCard) {
        onDrawCard(freshCard);
        setTimeout(() => setRevealCard(true), 100);
      }
    } else {
      onDrawCard(card);
      setTimeout(() => setRevealCard(true), 100);
    }
    setDrawing(false);
  }

  async function handleDone(completed: boolean) {
    if (!currentCard) return;
    const cardContent = CARD_CONTENT.find((c) => c.challenge.text === currentCard.text);
    if (cardContent) {
      onComplete(cardContent, completed);
    }
    setRevealCard(false);
  }

  function copyInvite() {
    navigator.clipboard.writeText(`Join me in Spicy Nights! Room code: ${room.code}`);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }

  if (isFinished) {
    const winner =
      room.player1_score === room.player2_score
        ? 'tie'
        : room.player1_score > room.player2_score
        ? 'player1'
        : 'player2';
    const youWon = winner === mySlot;
    const isTie = winner === 'tie';

    return (
      <div className="w-full max-w-md px-6 py-12 flex flex-col items-center min-h-screen justify-center">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 mb-6 shadow-lg shadow-rose-500/40">
            <Crown className="w-10 h-10 text-white" fill="white" />
          </div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-transparent">
            {isTie ? "It's a Tie!" : youWon ? 'You Won!' : `${winner === 'player1' ? room.player1_name : room.player2_name} Wins!`}
          </h2>
          <p className="text-rose-200/60 text-lg">What a night it was...</p>
        </div>

        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex justify-around items-center">
            <ScoreCard name={room.player1_name} score={room.player1_score} isMe={mySlot === 'player1'} isWinner={winner === 'player1'} />
            <div className="text-rose-200/30 text-2xl font-light">vs</div>
            <ScoreCard name={room.player2_name || 'Player 2'} score={room.player2_score} isMe={mySlot === 'player2'} isWinner={winner === 'player2'} />
          </div>
        </div>

        <button
          onClick={onLeave}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-2xl py-4 font-semibold text-lg transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" fill="white" />
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-5 py-6 flex flex-col min-h-screen">
      {/* Header: Scores + round */}
      <div className="flex items-center justify-between mb-4">
        <ScorePill name={myName} score={myScore} isMe align="left" />
        <div className="text-center">
          <p className="text-xs text-rose-200/40 font-medium">Round</p>
          <p className="text-xl font-bold text-rose-100">{room.round}</p>
        </div>
        <ScorePill name={partnerName || 'Player 2'} score={partnerScore} align="right" />
      </div>

      {/* Turn indicator */}
      <div className={`text-center py-3 rounded-xl mb-4 border transition-all ${isMyTurn ? 'bg-rose-950/60 border-rose-500/40' : 'bg-white/5 border-white/10'}`}>
        {isMyTurn ? (
          <p className="text-rose-200 font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Your turn!
          </p>
        ) : (
          <p className="text-rose-200/50 text-sm flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin" />
            Waiting for {partnerName}...
          </p>
        )}
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center">
        {currentCard && revealCard ? (
          <CardDisplay challenge={currentCard} spice={spice} isMyTurn={isMyTurn} onComplete={handleDone} />
        ) : currentCard && !revealCard ? (
          <CardBack spice={spice} />
        ) : isMyTurn ? (
          <DrawButton onClick={handleDraw} loading={drawing} spice={spice} />
        ) : (
          <WaitingForPartner partnerName={partnerName} />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <button onClick={copyInvite} className="flex items-center gap-1.5 text-rose-200/40 hover:text-rose-200 text-xs transition-colors">
          {showCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {showCopied ? 'Copied!' : 'Code: ' + room.code}
        </button>
        <button onClick={() => setShowEndConfirm(true)} className="text-rose-200/40 hover:text-rose-200 text-xs transition-colors">
          End game
        </button>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6" onClick={() => setShowEndConfirm(false)}>
          <div className="bg-gradient-to-b from-[#1a0a14] to-[#0f0610] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-rose-100 mb-2">End the game?</h3>
            <p className="text-rose-200/60 text-sm mb-6">This will end the game for both players and reveal the final scores.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 bg-white/10 hover:bg-white/15 rounded-xl py-3 font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); onEndGame(); }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 rounded-xl py-3 font-semibold transition-colors"
              >
                End game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePill({ name, score, isMe, align }: { name: string; score: number; isMe?: boolean; align: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className={align === 'left' ? 'text-left' : 'text-right'}>
        <p className="text-xs text-rose-200/50 font-medium truncate max-w-[80px]">{name}{isMe ? ' (You)' : ''}</p>
        <p className="text-lg font-bold text-rose-100">{score}</p>
      </div>
    </div>
  );
}

function CardBack({ spice }: { spice: SpiceLevel }) {
  const colors: Record<SpiceLevel, string> = {
    mild: 'from-emerald-700 to-teal-800',
    medium: 'from-orange-700 to-amber-800',
    hot: 'from-red-700 to-rose-800',
  };
  return (
    <div className={`w-full max-w-sm aspect-[3/4] rounded-2xl bg-gradient-to-br ${colors[spice]} border border-white/10 shadow-2xl flex items-center justify-center animate-card-flip`}>
      <Heart className="w-16 h-16 text-white/20" fill="white" />
    </div>
  );
}

function DrawButton({ onClick, loading, spice }: { onClick: () => void; loading: boolean; spice: SpiceLevel }) {
  const colors: Record<SpiceLevel, string> = {
    mild: 'from-emerald-600 to-teal-600 shadow-emerald-600/40',
    medium: 'from-orange-600 to-amber-600 shadow-orange-600/40',
    hot: 'from-red-600 to-rose-700 shadow-red-600/50',
  };
  return (
    <div className="text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className={`w-40 h-40 rounded-full bg-gradient-to-br ${colors[spice]} shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center gap-2 disabled:opacity-50 group`}
      >
        {loading ? (
          <RotateCw className="w-12 h-12 text-white animate-spin" />
        ) : (
          <>
            <Flame className="w-12 h-12 text-white group-hover:scale-110 transition-transform" fill="white" />
            <span className="text-white font-bold text-sm">Draw a Card</span>
          </>
        )}
      </button>
      <p className="text-rose-200/40 text-sm mt-4">Tap to reveal your challenge</p>
    </div>
  );
}

function WaitingForPartner({ partnerName }: { partnerName: string | null }) {
  return (
    <div className="text-center">
      <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <RotateCw className="w-10 h-10 text-rose-300/50 animate-spin" />
      </div>
      <p className="text-rose-200/50 text-sm">{partnerName || 'Your partner'} is taking their turn...</p>
      <div className="flex justify-center gap-1.5 mt-3">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function CardDisplay({ challenge, spice, isMyTurn, onComplete }: { challenge: GameRoom['current_challenge']; spice: SpiceLevel; isMyTurn: boolean; onComplete: (completed: boolean) => void }) {
  if (!challenge) return null;
  const meta = CHALLENGE_META[challenge.type];
  const intensityDots = Array.from({ length: 3 }, (_, i) => i < challenge.intensity);

  const spiceColors: Record<SpiceLevel, string> = {
    mild: 'from-emerald-700/50 to-teal-800/50',
    medium: 'from-orange-700/50 to-amber-800/50',
    hot: 'from-red-700/50 to-rose-800/50',
  };

  return (
    <div className="w-full max-w-sm animate-card-reveal">
      <div className={`relative rounded-2xl bg-gradient-to-br ${spiceColors[spice]} border ${meta.border} shadow-2xl overflow-hidden`}>
        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full ${meta.bg} ${meta.color} text-xs font-bold uppercase tracking-wider border ${meta.border}`}>
              {meta.label}
            </span>
            <div className="flex gap-1">
              {intensityDots.map((filled, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${filled ? 'bg-rose-400' : 'bg-white/15'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 py-8 flex items-center justify-center min-h-[180px]">
          <p className="text-rose-50 text-lg leading-relaxed text-center font-medium">{challenge.text}</p>
        </div>

        {/* Spice indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-rose-200/40 text-xs">
            <Flame className="w-3 h-3" />
            <span className="uppercase tracking-wider font-semibold">{spice} mode</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isMyTurn && (
        <div className="flex gap-3 mt-5 animate-slide-up">
          <button
            onClick={() => onComplete(false)}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl py-3.5 font-medium text-rose-200 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Skip (0 pts)
          </button>
          <button
            onClick={() => onComplete(true)}
            className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl py-3.5 font-semibold text-white transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Done! (+2 pts)
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ name, score, isMe, isWinner }: { name: string; score: number; isMe: boolean; isWinner: boolean }) {
  return (
    <div className="text-center">
      {isWinner && <Crown className="w-6 h-6 text-amber-300 mx-auto mb-1" fill="currentColor" />}
      <div className={`w-16 h-16 rounded-full ${isWinner ? 'bg-gradient-to-br from-amber-400 to-rose-500' : 'bg-white/10'} flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2`}>
        {name.charAt(0).toUpperCase()}
      </div>
      <p className="text-rose-100 font-semibold text-sm">{name}{isMe ? ' (You)' : ''}</p>
      <p className="text-3xl font-bold text-rose-200 mt-1">{score}</p>
      <p className="text-rose-200/40 text-xs">points</p>
    </div>
  );
}
