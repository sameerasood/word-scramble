'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create game');
      }

      // Store player info in sessionStorage
      sessionStorage.setItem('playerId', data.playerId);
      sessionStorage.setItem('playerName', playerName.trim());

      router.push(`/lobby/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/games/${gameCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join game');
      }

      sessionStorage.setItem('playerId', data.playerId);
      sessionStorage.setItem('playerName', playerName.trim());

      router.push(`/lobby/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Word Scramble
          </h1>
          <p className="text-xl text-purple-200">Race to unscramble!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {mode === 'home' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Create Game
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Join Game
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('home');
                  setError('');
                }}
                className="text-purple-200 hover:text-white transition-colors mb-2"
              >
                &larr; Back
              </button>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  maxLength={20}
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Game Code
                  </label>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="Enter 4-letter code"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase tracking-widest text-center text-xl"
                    maxLength={4}
                  />
                </div>
              )}

              {error && (
                <p className="text-red-300 text-sm text-center">{error}</p>
              )}

              <button
                onClick={mode === 'create' ? createGame : joinGame}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Loading...' : mode === 'create' ? 'Create Game' : 'Join Game'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
