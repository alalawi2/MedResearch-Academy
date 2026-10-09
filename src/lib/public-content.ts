export const academyEvent = {
  title: 'AI in Medical Education',
  start: '2026-04-08T20:00:00+04:00',
  end: '2026-04-08T21:00:00+04:00',
  speaker: 'Dr. Abdullah M. Al Alawi',
  description: 'From global evidence to local implementation — showcasing Bayan, an AI-powered board preparation platform.',
  joinUrl: 'https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1',
};

export function eventStatus(now = new Date()) {
  if (now.getTime() >= Date.parse(academyEvent.end)) return 'Past event';
  if (now.getTime() >= Date.parse(academyEvent.start)) return 'In progress';
  const day = (date: Date) => Math.floor((date.getTime() + 4 * 3600000) / 86400000);
  const days = day(new Date(academyEvent.start)) - day(now);
  return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'Upcoming';
}

export function isRecent(date: string, now = new Date()) {
  const age = now.getTime() - Date.parse(date);
  return Number.isFinite(age) && age >= 0 && age < 30 * 86400000;
}
