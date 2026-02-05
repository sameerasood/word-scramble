'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Game } from '@/types';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('playerId');
    setPlayerId(id);
  }, []);

  // Poll for game updates
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Game not found');
          return;
        }

        setGame(data.game);
      } catch {
        setError('Failed to load game');
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 500);

    return () => clearInterval(interval);
  }, [gameId]);

  // Timer countdown
  useEffect(() => {
    if (!game || game.status !== 'playing') return;

    const currentRound = game.rounds[game.currentRound];
    if (!currentRound?.startedAt) return;

    const updateTimer = () => {
      const elapsed = Date.now() - currentRound.startedAt;
      const remaining = Math.max(0, 50 - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [game]);

  // Reset guess when round changes
  useEffect(() => {
    setGuess('');
    setFeedback(null);
    inputRef.current?.focus();
  }, [game?.currentRound]);

  const submitGuess = async () => {
    if (!playerId || !guess.trim()) return;

    try {
      const res = await fetch(`/api/games/${gameId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, guess: guess.trim() }),
      });

      const data = await res.json();

      if (data.correct) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 500);
      }

      setGame(data.game);
    } catch {
      setError('Failed to submit guess');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-purple-200 hover:text-white transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  const currentRound = game.rounds[game.currentRound];
  const hasSolved = currentRound?.solvers.some((s) => s.playerId === playerId);

  // Sort players by score for leaderboard
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  if (game.status === 'finished') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-white text-lg font-semibold mb-4 text-center">
              Final Scores
            </h2>

            <div className="space-y-3 mb-6">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-400/50'
                      : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700'
                        : index === 2
                        ? 'bg-amber-600 text-amber-100'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-white font-medium flex-1">{player.name}</span>
                  <span className="text-2xl font-bold text-white">{player.score}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-purple-200">
            Round {game.currentRound + 1} of {game.totalRounds}
          </div>
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 10 ? 'text-red-400' : 'text-white'
            }`}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Scrambled Word */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-6">
          <div className="text-center mb-8">
            <div
              className={`text-5xl md:text-6xl font-bold tracking-[0.3em] text-white ${
                feedback === 'wrong' ? 'animate-shake' : ''
              } ${feedback === 'correct' ? 'animate-bounce-in text-green-400' : ''}`}
            >
              {currentRound?.scrambled}
            </div>
          </div>

          {hasSolved ? (
            <div className="text-center">
              <div className="text-green-400 text-xl font-semibold mb-2">
                You got it!
              </div>
              <p className="text-purple-200">Waiting for others...</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer"
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase tracking-widest text-center text-xl"
                autoFocus
              />
              <button
                onClick={submitGuess}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
              >
                Guess
              </button>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sortedPlayers.map((player) => {
              const solved = currentRound?.solvers.some(
                (s) => s.playerId === player.id
              );
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    solved ? 'bg-green-500/30' : 'bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{player.name}</div>
                    <div className="text-purple-200 text-xs">{player.score} pts</div>
                  </div>
                  {solved && <span className="text-green-400 text-lg">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
