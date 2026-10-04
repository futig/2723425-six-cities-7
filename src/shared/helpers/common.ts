export function generateRandomValue(min: number, max: number, numAfterDigit = 0): number {
  return Number(((Math.random() * (max - min)) + min).toFixed(numAfterDigit));
}

export function getRandomItem<T>(items: readonly T[]): T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function getRandomItems<T>(items: readonly T[], count = generateRandomValue(1, items.length)): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = generateRandomValue(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}
