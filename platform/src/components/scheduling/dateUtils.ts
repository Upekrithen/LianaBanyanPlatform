export function tomorrowAtNineLocal() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

export function toIsoFromLocalDateAndTime(dateInput: string, timeInput: string) {
  const local = new Date(`${dateInput}T${timeInput}:00`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

export function toLocalDateInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function toLocalDateTimeInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
