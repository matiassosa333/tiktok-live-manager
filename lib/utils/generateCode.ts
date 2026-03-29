const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRandomCode(length = 4) {
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    result += CHARS[randomIndex];
  }

  return `F-${result}`;
}