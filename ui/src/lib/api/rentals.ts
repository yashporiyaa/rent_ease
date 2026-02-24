import {
  CreateRentalPayload,
  DeliveryFilterStatus,
  ReturnFilterStatus,
} from "@/types";
import { API_URL } from "./config";

export const createRental = async (payload: CreateRentalPayload) => {
  try {
    const res = await fetch(`${API_URL}/rentals`, {
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
    const res = await fetch(`${API_URL}/rentals`, {
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
    const res = await fetch(`${API_URL}/rentals/${rentalId}`, {
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

export const updateRental = async (
  rentalId: string,
  payload: CreateRentalPayload,
) => {
  try {
    const res = await fetch(`${API_URL}/rentals/${rentalId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update rental failed");
    }

    return data;
  } catch (error) {
    console.error("updateRental failed:", error);
    throw error;
  }
};

export const deleteRental = async (rentalId: string) => {
  try {
    const res = await fetch(`${API_URL}/rentals/${rentalId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete rental failed");
    }

    return data;
  } catch (error) {
    console.error("deleteRental failed:", error);
    throw error;
  }
};

export const getCalendarData = async (start: string, end: string) => {
  try {
    const res = await fetch(
      `${API_URL}/rentals/calendar?start=${start}&end=${end}`,
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

export const checkRentalItemAvailability = async (payload: {
  itemId: string;
  quantity: number;
  fromAt: string;
  toAt: string;
  excludeRentalId?: string;
  sizeId?: string;
}) => {
  try {
    const res = await fetch(`${API_URL}/rentals/check-availability`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Item availability check failed");
    }

    return data;
  } catch (error) {
    console.error("checkRentalItemAvailability failed:", error);
    throw error;
  }
};

export const getDeliveryRentals = async (params: {
  rentalId?: string;
  fromDate?: string;
  toDate?: string;
  categoryId?: string;
  status?: DeliveryFilterStatus;
}) => {
  try {
    const searchParams = new URLSearchParams();

    if (params.rentalId) {
      searchParams.set("rentalId", params.rentalId);
    }
    if (params.fromDate) {
      searchParams.set("fromDate", params.fromDate);
    }
    if (params.toDate) {
      searchParams.set("toDate", params.toDate);
    }
    if (params.categoryId) {
      searchParams.set("categoryId", params.categoryId);
    }
    if (params.status) {
      searchParams.set("status", params.status);
    }

    const query = searchParams.toString();
    const url = query
      ? `${API_URL}/rentals/delivery?${query}`
      : `${API_URL}/rentals/delivery`;

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch delivery rentals failed");
    }

    return data;
  } catch (error) {
    console.error("getDeliveryRentals failed:", error);
    throw error;
  }
};

export const updateDeliveryRentalStatus = async (
  rentalItemId: string,
  status: "picked" | "pending",
) => {
  try {
    const res = await fetch(
      `${API_URL}/rentals/delivery/${rentalItemId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update delivery status failed");
    }

    return data;
  } catch (error) {
    console.error("updateDeliveryRentalStatus failed:", error);
    throw error;
  }
};

export const getReturnRentals = async (params: {
  rentalId?: string;
  fromDate?: string;
  toDate?: string;
  categoryId?: string;
  status?: ReturnFilterStatus;
}) => {
  try {
    const searchParams = new URLSearchParams();

    if (params.rentalId) {
      searchParams.set("rentalId", params.rentalId);
    }
    if (params.fromDate) {
      searchParams.set("fromDate", params.fromDate);
    }
    if (params.toDate) {
      searchParams.set("toDate", params.toDate);
    }
    if (params.categoryId) {
      searchParams.set("categoryId", params.categoryId);
    }
    if (params.status) {
      searchParams.set("status", params.status);
    }

    const query = searchParams.toString();
    const url = query
      ? `${API_URL}/rentals/return?${query}`
      : `${API_URL}/rentals/return`;

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch return rentals failed");
    }

    return data;
  } catch (error) {
    console.error("getReturnRentals failed:", error);
    throw error;
  }
};

export const updateReturnRentalStatus = async (
  rentalItemId: string,
  status: "returned",
) => {
  try {
    const res = await fetch(`${API_URL}/rentals/return/${rentalItemId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update return status failed");
    }

    return data;
  } catch (error) {
    console.error("updateReturnRentalStatus failed:", error);
    throw error;
  }
};
