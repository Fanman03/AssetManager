// lib/timeConverter.ts

export function timeConverter(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const formatted = `${month} ${day} ${year}`;
  const ago = timeAgo(unixTimestamp * 1000);
  return `${formatted} (${ago})`;
}

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);
  const future = diffSeconds < 0;
  const seconds = Math.abs(diffSeconds);

  const timeFormats: [number, string, string | number][] = [
    [60, 'seconds', 1],
    [120, '1 minute ago', '1 minute from now'],
    [3600, 'minutes', 60],
    [7200, '1 hour ago', '1 hour from now'],
    [86400, 'hours', 3600],
    [172800, 'Yesterday', 'Tomorrow'],
    [604800, 'days', 86400],
    [1209600, 'Last week', 'Next week'],
    [2419200, 'weeks', 604800],
    [4838400, 'Last month', 'Next month'],
    [29030400, 'months', 2419200],
    [58060800, 'Last year', 'Next year'],
    [2903040000, 'years', 29030400],
    [5806080000, 'Last century', 'Next century'],
    [58060800000, 'centuries', 2903040000],
  ];

  const token = future ? 'from now' : 'ago';
  const choice = future ? 2 : 1;

  for (const format of timeFormats) {
    if (seconds < format[0]) {
      if (typeof format[2] === 'string') return format[choice] as string;
      return `${Math.floor(seconds / (format[2] as number))} ${format[1]} ${token}`;
    }
  }

  return `${Math.floor(seconds)} seconds ${token}`;
}