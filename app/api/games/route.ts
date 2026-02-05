import { NextResponse } from 'next/server';
import { createGame } from '@/lib/game-store';

export async function POST(request: Request) {
  try {
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const { game, playerId } = createGame(playerName.trim());

    return NextResponse.json({
      gameId: game.id,
      playerId,
      game,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
