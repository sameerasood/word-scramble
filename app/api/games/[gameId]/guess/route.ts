import { NextResponse } from 'next/server';
import { submitGuess } from '@/lib/game-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { playerId, guess } = await request.json();

    if (!playerId || !guess) {
      return NextResponse.json(
        { error: 'Player ID and guess are required' },
        { status: 400 }
      );
    }

    const result = submitGuess(gameId, playerId, guess);

    if (!result) {
      return NextResponse.json(
        { error: 'Game not found or not in progress' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      correct: result.correct,
      game: {
        ...result.game,
        rounds: result.game.rounds.map((round, index) => ({
          scrambled: round.scrambled,
          startedAt: round.startedAt,
          solvers: round.solvers,
          word: index < result.game.currentRound || result.game.status === 'finished' ? round.word : undefined,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit guess' },
      { status: 500 }
    );
  }
}
