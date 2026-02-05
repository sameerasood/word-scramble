import { NextResponse } from 'next/server';
import { joinGame } from '@/lib/game-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = joinGame(gameId, playerName.trim());

    if (!result) {
      return NextResponse.json(
        { error: 'Game not found or already started' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gameId: result.game.id,
      playerId: result.playerId,
      game: result.game,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
