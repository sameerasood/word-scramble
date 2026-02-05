import { Game, Player } from '@/types';
import { generateGameCode, generatePlayerId, scrambleWord, calculatePoints } from './utils';
import { getRandomWords } from './words';

// Use globalThis to persist state across module reloads in Next.js dev mode
declare global {
  // eslint-disable-next-line no-var
  var _games: Map<string, Game> | undefined;
}

// In-memory game storage (persists across hot reloads)
const games = globalThis._games ?? new Map<string, Game>();
globalThis._games = games;

const TOTAL_ROUNDS = 10;
const ROUND_DURATION = 50000; // 50 seconds

export function createGame(hostName: string): { game: Game; playerId: string } {
  // Opportunistically clean up old games
  cleanupOldGames();

  const gameId = generateGameCode();
  const playerId = generatePlayerId();

  const host: Player = {
    id: playerId,
    name: hostName,
    score: 0,
  };

  const game: Game = {
    id: gameId,
    hostId: playerId,
    players: [host],
    status: 'lobby',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    rounds: [],
    createdAt: Date.now(),
  };

  games.set(gameId, game);
  return { game, playerId };
}

export function joinGame(gameId: string, playerName: string): { game: Game; playerId: string } | null {
  const game = games.get(gameId.toUpperCase());
  if (!game || game.status !== 'lobby') {
    return null;
  }

  const playerId = generatePlayerId();
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
  };

  game.players.push(player);
  return { game, playerId };
}

export function getGame(gameId: string): Game | null {
  return games.get(gameId.toUpperCase()) || null;
}

export function startGame(gameId: string, playerId: string): Game | null {
  const game = games.get(gameId.toUpperCase());
  if (!game || game.hostId !== playerId || game.status !== 'lobby') {
    return null;
  }

  // Generate words for all rounds
  const words = getRandomWords(TOTAL_ROUNDS);
  game.rounds = words.map((word) => ({
    word,
    scrambled: scrambleWord(word),
    startedAt: 0,
    solvers: [],
  }));

  game.status = 'playing';
  game.currentRound = 0;
  game.rounds[0].startedAt = Date.now();

  return game;
}

export function submitGuess(
  gameId: string,
  playerId: string,
  guess: string
): { correct: boolean; game: Game } | null {
  const game = games.get(gameId.toUpperCase());
  if (!game || game.status !== 'playing') {
    return null;
  }

  const round = game.rounds[game.currentRound];
  if (!round) {
    return null;
  }

  // Check if player already solved this round
  if (round.solvers.some((s) => s.playerId === playerId)) {
    return { correct: false, game };
  }

  // Check answer
  const correct = guess.toUpperCase().trim() === round.word.toUpperCase();

  if (correct) {
    const solvedAt = Date.now();
    round.solvers.push({ playerId, solvedAt });

    // Award points based on solve position
    const position = round.solvers.length - 1;
    const points = calculatePoints(position);

    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.score += points;
      player.solvedAt = solvedAt;
    }

    // Check if everyone has solved or time is up
    checkRoundEnd(game);
  }

  return { correct, game };
}

function checkRoundEnd(game: Game): void {
  const round = game.rounds[game.currentRound];
  const allSolved = round.solvers.length === game.players.length;
  const timeUp = Date.now() - round.startedAt > ROUND_DURATION;

  if (allSolved || timeUp) {
    // Move to next round or end game
    if (game.currentRound < game.totalRounds - 1) {
      game.currentRound++;
      game.rounds[game.currentRound].startedAt = Date.now();
      // Reset player solvedAt for new round
      game.players.forEach((p) => (p.solvedAt = undefined));
    } else {
      game.status = 'finished';
    }
  }
}

// Periodic check for round timeouts (called from polling)
export function checkGameState(gameId: string): Game | null {
  const game = games.get(gameId.toUpperCase());
  if (!game || game.status !== 'playing') {
    return game || null;
  }

  checkRoundEnd(game);
  return game;
}

// Clean up old games (games older than 1 hour)
// Called opportunistically during game creation
function cleanupOldGames(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  games.forEach((game, id) => {
    if (game.createdAt < oneHourAgo) {
      games.delete(id);
    }
  });
}
