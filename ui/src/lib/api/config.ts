const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.BASE_URL ??
  "http://localhost:3001";

export const API_URL = rawApiUrl.trim().replace(/\/+$/, "");
