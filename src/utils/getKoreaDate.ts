const timeDiff = 9 * 60 * 60 * 1000;

export function getKoreaDate(): Date {
  const curDate = new Date();
  const utc = curDate.getTime() + curDate.getTimezoneOffset() * 60 * 1000;

  return new Date(utc + timeDiff);
}

export function convertKoreaDate(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;

  return new Date(utc + timeDiff);
}
