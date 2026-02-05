import { NextResponse } from 'next/server';
import { checkGameState } from '@/lib/game-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  const game = checkGameState(gameId);

  if (!game) {
    return NextResponse.json(
      { error: 'Game not found' },
      { status: 404 }
    );
  }

  // Don't expose the actual word during gameplay
  const safeGame = {
    ...game,
    rounds: game.rounds.map((round, index) => ({
      scrambled: round.scrambled,
      startedAt: round.startedAt,
      solvers: round.solvers,
      // Only reveal word after round is complete or game is finished
      word: index < game.currentRound || game.status === 'finished' ? round.word : undefined,
    })),
  };

  return NextResponse.json({ game: safeGame });
}
