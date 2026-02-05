export interface Player {
  id: string;
  name: string;
  score: number;
  solvedAt?: number; // timestamp when they solved current round
}

export interface GameRound {
  word: string;
  scrambled: string;
  startedAt: number;
  solvers: { playerId: string; solvedAt: number }[];
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'finished';
  currentRound: number;
  totalRounds: number;
  rounds: GameRound[];
  createdAt: number;
}

export interface GameState {
  game: Game;
  playerId: string;
  isHost: boolean;
}
