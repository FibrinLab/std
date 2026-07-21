export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Null once the target has passed.
export function countdownParts(targetMs: number, nowMs: number): CountdownParts | null {
  const diff = targetMs - nowMs;
  if (diff <= 0) return null;
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60,
  };
}
