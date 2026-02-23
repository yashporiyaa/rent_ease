import {
  RentalPaymentCustomerOption,
  RentalPaymentListFilters,
  RentalPaymentPayload,
} from "@/types";

export const getRentalPayments = async (params: RentalPaymentListFilters = {}) => {
  try {
    const searchParams = new URLSearchParams();

    if (params.fromDate) {
      searchParams.set("fromDate", params.fromDate);
    }
    if (params.toDate) {
      searchParams.set("toDate", params.toDate);
    }

    const query = searchParams.toString();
    const url = query
      ? `http://localhost:3001/rental-payments?${query}`
      : "http://localhost:3001/rental-payments";

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch payments failed");
    }

    return data;
  } catch (error) {
    console.error("getRentalPayments failed:", error);
    throw error;
  }
};

export const searchRentalPaymentCustomers = async (search: string) => {
  try {
    const query = search.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";

    const res = await fetch(
      `http://localhost:3001/rental-payments/customers${query}`,
      {
        credentials: "include",
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch payment customers failed");
    }

    return data as {
      success: boolean;
      data: RentalPaymentCustomerOption[];
    };
  } catch (error) {
    console.error("searchRentalPaymentCustomers failed:", error);
    throw error;
  }
};

export const getRentalPaymentPendingRentals = async (customerId: string) => {
  try {
    const res = await fetch(
      `http://localhost:3001/rental-payments/customers/${customerId}/pending-rentals`,
      {
        credentials: "include",
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch pending rentals failed");
    }

    return data;
  } catch (error) {
    console.error("getRentalPaymentPendingRentals failed:", error);
    throw error;
  }
};

export const createRentalPayment = async (payload: RentalPaymentPayload) => {
  try {
    const res = await fetch("http://localhost:3001/rental-payments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create payment failed");
    }

    return data;
  } catch (error) {
    console.error("createRentalPayment failed:", error);
    throw error;
  }
};

export const updateRentalPayment = async (
  rentalPaymentId: string,
  payload: RentalPaymentPayload,
) => {
  try {
    const res = await fetch(`http://localhost:3001/rental-payments/${rentalPaymentId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update payment failed");
    }

    return data;
  } catch (error) {
    console.error("updateRentalPayment failed:", error);
    throw error;
  }
};

export const deleteRentalPayment = async (rentalPaymentId: string) => {
  try {
    const res = await fetch(`http://localhost:3001/rental-payments/${rentalPaymentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete payment failed");
    }

    return data;
  } catch (error) {
    console.error("deleteRentalPayment failed:", error);
    throw error;
  }
};
