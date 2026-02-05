// Generate a random 4-character game code
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate a unique player ID
export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Scramble a word (ensure it's different from original)
export function scrambleWord(word: string): string {
  const letters = word.split('');
  let scrambled: string;

  // Keep shuffling until we get something different
  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
  } while (scrambled === word && word.length > 1);

  return scrambled;
}

// Calculate points based on solve position
export function calculatePoints(position: number): number {
  const points = [100, 80, 60, 50, 40, 30, 25, 20, 15, 10];
  return points[position] || 5;
}

// Check if answer is correct (case-insensitive)
export function checkAnswer(guess: string, answer: string): boolean {
  return guess.toUpperCase().trim() === answer.toUpperCase().trim();
}
