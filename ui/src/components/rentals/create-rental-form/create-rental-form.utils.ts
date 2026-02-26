export const GST_RATE_OPTIONS = [0, 5, 12, 18, 28];

export const HOURS_12 = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export const makeLineId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const nowLocalDateTime = () => {
  const now = new Date();
  const timeZoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timeZoneOffset).toISOString().slice(0, 16);
};

export const toLocalDateTimeInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timeZoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timeZoneOffset).toISOString().slice(0, 16);
};

export const splitLocalDateTime = (value: string) => {
  if (!value) return { date: "", time: "" };
  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
};

export const get12HourParts = (time24?: string) => {
  const [hoursText = "00", minutesText = "00"] = (time24 || "").split(":");
  const hoursNumber = Number(hoursText);
  const minutes = /^\d{2}$/.test(minutesText) ? minutesText : "00";

  if (!Number.isFinite(hoursNumber) || hoursNumber < 0 || hoursNumber > 23) {
    return { hour: "12", minute: minutes, period: "AM" as "AM" | "PM" };
  }

  const period = hoursNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hoursNumber % 12 || 12;

  return {
    hour: String(normalizedHour).padStart(2, "0"),
    minute: minutes,
    period,
  };
};

export const to24Hour = (hour12: string, minute: string, period: "AM" | "PM") => {
  const parsedHour = Number(hour12);
  const normalizedHour = Number.isFinite(parsedHour) ? parsedHour % 12 : 0;
  const hour24 = period === "PM" ? normalizedHour + 12 : normalizedHour;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
};

export const parseInputDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};
