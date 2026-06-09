function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function generateICS(event: {
  title: string;
  description: string;
  date: Date;
  endDate?: Date | null;
  venue: string;
  address: string;
  city: string;
  country: string;
}): string {
  const start = formatICSDate(new Date(event.date));
  const end = formatICSDate(event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + 3600000));
  const location = `${event.venue}, ${event.address}, ${event.city}, ${event.country}`;
  const desc = event.description.replace(/\n/g, "\\n").slice(0, 500);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Qualivoire Connect//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    `UID:${Date.now()}@qualievents`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(event: {
  title: string;
  description: string;
  date: Date;
  endDate?: Date | null;
  venue: string;
  city: string;
}): string {
  const start = formatICSDate(new Date(event.date));
  const end = formatICSDate(event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + 3600000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description.slice(0, 500),
    location: `${event.venue}, ${event.city}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
