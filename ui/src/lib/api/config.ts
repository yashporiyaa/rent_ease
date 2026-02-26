const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.BASE_URL;

  if (!rawApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
export const API_URL = rawApiUrl.trim().replace(/\/+$/, "");
