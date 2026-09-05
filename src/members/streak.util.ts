/**
 * A member's "streak" is the number of ISO weeks (Mon-Sun) in which they
 * attended on at least 5 distinct days. Not required to be consecutive —
 * each qualifying week is worth one point, and the streak is the running
 * total.
 */
export function computeStreak(checkInDates: Date[]): number {
  const daysByWeek = new Map<string, Set<string>>();

  for (const date of checkInDates) {
    const week = isoWeekKey(date);
    const day = date.toISOString().slice(0, 10);
    const days = daysByWeek.get(week) ?? new Set<string>();
    days.add(day);
    daysByWeek.set(week, days);
  }

  let streak = 0;
  for (const days of daysByWeek.values()) {
    if (days.size >= 5) streak += 1;
  }
  return streak;
}

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Thursday of the same ISO week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${d.getUTCFullYear()}-W${weekNum}`;
}
