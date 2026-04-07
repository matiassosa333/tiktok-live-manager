function pickRandom<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

export function generateUniqueNumericCode(existingCodes: string[]) {
  const usedNumbers = new Set(
    existingCodes
      .map((code) => Number(code))
      .filter((value) => Number.isInteger(value) && value > 0)
  );

  const twoDigitAvailable: number[] = [];
  for (let i = 1; i <= 99; i++) {
    if (!usedNumbers.has(i)) {
      twoDigitAvailable.push(i);
    }
  }

  if (twoDigitAvailable.length > 0) {
    const value = pickRandom(twoDigitAvailable);
    return String(value).padStart(2, "0");
  }

  const threeDigitAvailable: number[] = [];
  for (let i = 100; i <= 999; i++) {
    if (!usedNumbers.has(i)) {
      threeDigitAvailable.push(i);
    }
  }

  if (threeDigitAvailable.length === 0) {
    throw new Error("No hay códigos disponibles para este live.");
  }

  return String(pickRandom(threeDigitAvailable));
}