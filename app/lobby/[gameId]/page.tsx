'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Game } from '@/types';

export default function LobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

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

        // If game started, redirect to game page
        if (data.game.status === 'playing') {
          router.push(`/game/${gameId}`);
        }
      } catch {
        setError('Failed to load game');
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 1000);

    return () => clearInterval(interval);
  }, [gameId, router]);

  const startGame = async () => {
    if (!playerId) return;

    setStarting(true);
    try {
      const res = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start game');
        setStarting(false);
        return;
      }

      router.push(`/game/${gameId}`);
    } catch {
      setError('Failed to start game');
      setStarting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameId);
  };

  const isHost = game?.hostId === playerId;

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

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-purple-200">Code:</span>
            <button
              onClick={copyCode}
              className="bg-white/20 px-4 py-2 rounded-lg text-2xl font-mono tracking-widest text-white hover:bg-white/30 transition-colors"
            >
              {gameId}
            </button>
          </div>
          <p className="text-purple-300 text-sm mt-2">Click to copy</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          <h2 className="text-white text-lg font-semibold mb-4">
            Players ({game.players.length})
          </h2>

          <div className="space-y-2 mb-6">
            {game.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">{player.name}</span>
                {player.id === game.hostId && (
                  <span className="ml-auto text-xs bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>

          {isHost ? (
            <button
              onClick={startGame}
              disabled={starting || game.players.length < 1}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {starting ? 'Starting...' : 'Start Game'}
            </button>
          ) : (
            <div className="text-center text-purple-200 py-4">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
