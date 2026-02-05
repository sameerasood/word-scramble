import { NextResponse } from 'next/server';
import { startGame } from '@/lib/game-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const game = startGame(gameId, playerId);

    if (!game) {
      return NextResponse.json(
        { error: 'Cannot start game. Either not found, not the host, or already started.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ game });
  } catch {
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
