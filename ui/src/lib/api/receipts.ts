import {
  ReceiptCustomerOption,
  ReceiptListFilters,
  ReceiptPayload,
} from "@/types";

export const getReceipts = async (params: ReceiptListFilters = {}) => {
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
      ? `http://localhost:3001/receipts?${query}`
      : "http://localhost:3001/receipts";

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch receipts failed");
    }

    return data;
  } catch (error) {
    console.error("getReceipts failed:", error);
    throw error;
  }
};

export const searchReceiptCustomers = async (search: string) => {
  try {
    const query = search.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";

    const res = await fetch(`http://localhost:3001/receipts/customers${query}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch receipt customers failed");
    }

    return data as {
      success: boolean;
      data: ReceiptCustomerOption[];
    };
  } catch (error) {
    console.error("searchReceiptCustomers failed:", error);
    throw error;
  }
};

export const getReceiptPendingRentals = async (customerId: string) => {
  try {
    const res = await fetch(
      `http://localhost:3001/receipts/customers/${customerId}/pending-rentals`,
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
    console.error("getReceiptPendingRentals failed:", error);
    throw error;
  }
};

export const createReceipt = async (payload: ReceiptPayload) => {
  try {
    const res = await fetch("http://localhost:3001/receipts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create receipt failed");
    }

    return data;
  } catch (error) {
    console.error("createReceipt failed:", error);
    throw error;
  }
};

export const updateReceipt = async (receiptId: string, payload: ReceiptPayload) => {
  try {
    const res = await fetch(`http://localhost:3001/receipts/${receiptId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update receipt failed");
    }

    return data;
  } catch (error) {
    console.error("updateReceipt failed:", error);
    throw error;
  }
};

export const deleteReceipt = async (receiptId: string) => {
  try {
    const res = await fetch(`http://localhost:3001/receipts/${receiptId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete receipt failed");
    }

    return data;
  } catch (error) {
    console.error("deleteReceipt failed:", error);
    throw error;
  }
};
