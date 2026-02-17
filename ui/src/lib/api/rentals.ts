import { CreateRentalPayload } from "@/types";

export const createRental = async (payload: CreateRentalPayload) => {
  try {
    const res = await fetch("http://localhost:3001/rentals", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create rental failed");
    }

    return data;
  } catch (error) {
    console.error("createRental failed:", error);
    throw error;
  }
};

export const getRentals = async () => {
  try {
    const res = await fetch("http://localhost:3001/rentals", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch rentals failed");
    }

    return data;
  } catch (error) {
    console.error("getRentals failed:", error);
    throw error;
  }
};

export const getRentalById = async (rentalId: string) => {
  try {
    const res = await fetch(`http://localhost:3001/rentals/${rentalId}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch rental failed");
    }

    return data;
  } catch (error) {
    console.error("getRentalById failed:", error);
    throw error;
  }
};

export const getCalendarData = async (start: string, end: string) => {
  try {
    const res = await fetch(
      `http://localhost:3001/rentals/calendar?start=${start}&end=${end}`,
      { credentials: "include" },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch calendar data failed");
    }

    return data;
  } catch (error) {
    console.error("getCalendarData failed:", error);
    throw error;
  }
};